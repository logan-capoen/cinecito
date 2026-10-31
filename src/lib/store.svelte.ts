import type { RealtimeChannel, Session as AuthSession } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { fetchTranslations, type TmdbMovie, type Translations } from './tmdb'
import { i18n } from './i18n.svelte'

export type MovieStatus = 'wishlist' | 'planned' | 'watched'
export type Who = 'Baguette' | 'Taquito'

export interface Movie {
  id: string
  tmdb_id: number | null
  title: string
  year: string | null
  overview: string | null
  translations: Translations | null
  poster_path: string | null
  added_by: Who | null
  added_at: string
  status: MovieStatus
  watched_at: string | null
  rating: number | null
}

export interface Session {
  id: string
  movie_id: string
  starts_at: string
}

class CinecitoStore {
  auth = $state<AuthSession | null>(null)
  authReady = $state(false)
  movies = $state<Movie[]>([])
  sessions = $state<Session[]>([])
  loading = $state(false)
  error = $state<string | null>(null)

  #channel: RealtimeChannel | null = null

  constructor() {
    supabase.auth.getSession().then(({ data }) => {
      this.#setAuth(data.session)
      this.authReady = true
    })
    supabase.auth.onAuthStateChange((_event, session) => this.#setAuth(session))
  }

  #setAuth(session: AuthSession | null) {
    const wasLogged = !!this.auth
    this.auth = session
    if (session && !wasLogged) {
      this.refresh()
      this.#subscribe()
    } else if (!session) {
      this.movies = []
      this.sessions = []
      this.#channel?.unsubscribe()
      this.#channel = null
    }
  }

  #subscribe() {
    this.#channel?.unsubscribe()
    this.#channel = supabase
      .channel('cinecito')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movies' }, () => this.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => this.refresh())
      .subscribe()
  }

  async refresh() {
    this.loading = true
    const [movies, sessions] = await Promise.all([
      supabase.from('movies').select('*'),
      supabase.from('sessions').select('*'),
    ])
    this.loading = false
    if (movies.error || sessions.error) {
      this.error = (movies.error ?? sessions.error)!.message
      return
    }
    this.error = null
    this.movies = movies.data as Movie[]
    this.sessions = sessions.data as Session[]
  }

  async #run(op: PromiseLike<{ error: { message: string } | null }>) {
    const { error } = await op
    if (error) this.error = error.message
    await this.refresh()
  }

  // --- Auth ---

  /** Un seul compte partagé : on ne demande que le mot de passe. */
  async signIn(password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: import.meta.env.VITE_LOGIN_EMAIL,
      password,
    })
    return error?.message ?? null
  }

  signOut() {
    return supabase.auth.signOut()
  }

  // --- Lecture ---

  get wishlist() {
    return this.movies
      .filter((m) => m.status === 'wishlist')
      .sort((a, b) => b.added_at.localeCompare(a.added_at))
  }

  get watched() {
    return this.movies
      .filter((m) => m.status === 'watched')
      .sort((a, b) => (b.watched_at ?? '').localeCompare(a.watched_at ?? ''))
  }

  get upcoming() {
    return [...this.sessions].sort((a, b) => a.starts_at.localeCompare(b.starts_at))
  }

  movie(id: string) {
    return this.movies.find((m) => m.id === id)
  }

  // --- Écriture ---

  async addMovie(input: { tmdb?: TmdbMovie; title: string; addedBy: Who }) {
    const t = input.tmdb
    const translations = t ? await fetchTranslations(t.id) : null
    return this.#run(
      supabase.from('movies').insert({
        tmdb_id: t?.id ?? null,
        title: (t?.title ?? input.title).trim(),
        year: t?.release_date?.slice(0, 4) || null,
        overview: t?.overview || null,
        translations,
        poster_path: t?.poster_path ?? null,
        added_by: input.addedBy,
      }),
    )
  }

  removeMovie(id: string) {
    return this.#run(supabase.from('movies').delete().eq('id', id))
  }

  async plan(movieId: string, startsAt: Date) {
    const { error } = await supabase
      .from('sessions')
      .insert({ movie_id: movieId, starts_at: startsAt.toISOString() })
    if (error) {
      this.error = error.message
      return
    }
    await this.#run(supabase.from('movies').update({ status: 'planned' }).eq('id', movieId))
  }

  /** Soirée faite : le film passe dans « Vus ». */
  async validate(session: Session, rating?: number) {
    const { error } = await supabase
      .from('movies')
      .update({ status: 'watched', watched_at: session.starts_at, rating: rating ?? null })
      .eq('id', session.movie_id)
    if (error) {
      this.error = error.message
      return
    }
    await this.#run(supabase.from('sessions').delete().eq('id', session.id))
  }

  /** Pas vu : le film retourne dans la liste de souhaits. */
  async cancel(session: Session) {
    const { error } = await supabase
      .from('movies')
      .update({ status: 'wishlist' })
      .eq('id', session.movie_id)
    if (error) {
      this.error = error.message
      return
    }
    await this.#run(supabase.from('sessions').delete().eq('id', session.id))
  }

  /** Remettre un film vu dans la liste (pour le revoir). */
  rewatch(movieId: string) {
    return this.#run(
      supabase
        .from('movies')
        .update({ status: 'wishlist', watched_at: null, rating: null })
        .eq('id', movieId),
    )
  }
}

export const store = new CinecitoStore()

/** Titre dans la langue choisie (repli sur le titre enregistré) */
export function movieTitle(m: Movie | undefined) {
  if (!m) return ''
  return m.translations?.[i18n.lang]?.title || m.title
}

export function movieOverview(m: Movie) {
  return m.translations?.[i18n.lang]?.overview || m.overview
}

export function formatDateTime(iso: string, withTime = true) {
  const d = new Date(iso)
  const day = d.toLocaleDateString(i18n.locale, { weekday: 'long', day: 'numeric', month: 'long' })
  if (!withTime) return day
  return `${day} · ${formatTime(iso)}`
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(i18n.locale, { hour: '2-digit', minute: '2-digit' })
}

/** YYYY-MM-DD en heure locale */
export function dayKey(d: Date | string) {
  return new Date(d).toLocaleDateString('sv-SE')
}

export function isPast(iso: string) {
  return new Date(iso).getTime() < Date.now()
}
