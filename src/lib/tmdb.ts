import { i18n, type Lang } from './i18n.svelte'

export interface TmdbMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date?: string
}

export type Translations = Partial<Record<Lang, { title: string; overview: string }>>

const BASE = 'https://api.themoviedb.org/3'
const LOCALES: Record<Lang, string> = { es: 'es-MX', fr: 'fr-FR' }

async function get<T>(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const qs = new URLSearchParams(params)
  const res = await fetch(`${BASE}${path}?${qs}`, {
    headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` },
    signal,
  })
  if (!res.ok) throw new Error(`TMDB ${res.status}`)
  return res.json()
}

export async function searchMovies(query: string, signal?: AbortSignal): Promise<TmdbMovie[]> {
  const data = await get<{ results: TmdbMovie[] }>(
    '/search/movie',
    { query, language: i18n.locale, include_adult: 'false' },
    signal,
  )
  return data.results.slice(0, 8)
}

/** Titre + synopsis dans les deux langues, pour pouvoir changer de langue après coup. */
export async function fetchTranslations(id: number): Promise<Translations> {
  const entries = await Promise.all(
    (Object.keys(LOCALES) as Lang[]).map(async (lang) => {
      try {
        const m = await get<TmdbMovie>(`/movie/${id}`, { language: LOCALES[lang] })
        return [lang, { title: m.title, overview: m.overview }] as const
      } catch {
        return null
      }
    }),
  )
  return Object.fromEntries(entries.filter((e) => e !== null))
}

export function posterUrl(path: string | null | undefined, size: 'w92' | 'w185' | 'w342' = 'w185') {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null
}
