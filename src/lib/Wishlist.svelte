<script lang="ts">
  import { store, movieTitle, movieOverview, type Who } from './store.svelte'
  import { t } from './i18n.svelte'
  import MovieSearch from './MovieSearch.svelte'
  import Poster from './Poster.svelte'
  import Overview from './Overview.svelte'
  import type { TmdbMovie } from './tmdb'

  let { onplan }: { onplan: (id: string) => void } = $props()

  let addedBy = $state<Who>((localStorage.getItem('cinecito:who') as Who) ?? 'Baguette')
  $effect(() => localStorage.setItem('cinecito:who', addedBy))

  const people: [Who, string][] = [
    ['Baguette', '🥖'],
    ['Taquito', '🌮'],
  ]

  function add(movie: TmdbMovie | null, rawTitle: string) {
    store.addMovie({ tmdb: movie ?? undefined, title: rawTitle, addedBy })
  }
</script>

<section class="space-y-6">
  <div class="space-y-3 rounded-2xl border border-white/10 bg-velvet/60 p-4 sm:p-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="font-display text-xl font-semibold">{t('addMovie')}</h2>
      <div class="flex gap-2 text-sm">
        {#each people as [who, emoji] (who)}
          <button
            type="button"
            class="rounded-full border px-3 py-1 transition
              {addedBy === who ? 'border-marigold bg-marigold/20 text-marigold' : 'border-white/10 text-crema/60 hover:border-white/30'}"
            onclick={() => (addedBy = who)}
          >
            {emoji} {who}
          </button>
        {/each}
      </div>
    </div>
    <MovieSearch onpick={add} />
  </div>

  {#if store.wishlist.length === 0}
    <p class="py-10 text-center text-crema/50">{t('emptyWishlist')}</p>
  {:else}
    <ul class="space-y-3">
      {#each store.wishlist as movie (movie.id)}
        <li class="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-3">
          <Poster path={movie.poster_path} title={movieTitle(movie)} class="w-16 sm:w-20" />
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="flex items-start justify-between gap-2">
              <p class="font-semibold">
                {movieTitle(movie)}
                {#if movie.year}<span class="font-normal text-crema/50">({movie.year})</span>{/if}
              </p>
              <span title={t('proposedBy', { who: movie.added_by ?? '' })}>{movie.added_by === 'Taquito' ? '🌮' : '🥖'}</span>
            </div>
            <Overview text={movieOverview(movie)} />
            <div class="mt-auto flex items-center justify-end gap-3 pt-2">
              <button
                class="px-1 py-1.5 text-sm text-crema/30 transition hover:text-rosa"
                onclick={() => confirm(t('confirmDelete', { title: movieTitle(movie) })) && store.removeMovie(movie.id)}
              >
                {t('delete')}
              </button>
              <button
                class="rounded-xl bg-marigold/90 px-3 py-2 text-sm font-semibold text-night transition hover:bg-marigold"
                onclick={() => onplan(movie.id)}
              >
                {t('schedule')}
              </button>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>
