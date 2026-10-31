<script lang="ts">
  import { store, formatDateTime, movieTitle, movieOverview } from './store.svelte'
  import { t } from './i18n.svelte'
  import Poster from './Poster.svelte'
  import Overview from './Overview.svelte'
</script>

<section>
  {#if store.watched.length === 0}
    <p class="py-10 text-center text-crema/50">{t('emptyWatched')}</p>
  {:else}
    <p class="mb-4 text-center text-crema/60">
      {store.watched.length === 1 ? t('watchedOne') : t('watchedMany', { n: store.watched.length })}
    </p>
    <ul class="grid gap-3 sm:grid-cols-2">
      {#each store.watched as movie (movie.id)}
        <li class="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <Poster path={movie.poster_path} title={movieTitle(movie)} class="w-16 sm:w-20" />
          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="flex items-start justify-between gap-2">
              <p class="font-semibold">
                {movieTitle(movie)}
                {#if movie.year}<span class="font-normal text-crema/50">({movie.year})</span>{/if}
              </p>
              <span>{movie.added_by === 'Taquito' ? '🌮' : '🥖'}</span>
            </div>
            {#if movie.watched_at}
              <p class="text-sm text-crema/50 first-letter:uppercase">{formatDateTime(movie.watched_at, false)}</p>
            {/if}
            {#if movie.rating}<p class="text-lg tracking-tight">{'🌮'.repeat(movie.rating)}</p>{/if}
            <Overview text={movieOverview(movie)} />
            <div class="mt-auto flex justify-end gap-1 pt-1 text-xs">
              <button class="px-2 py-1.5 text-crema/40 hover:text-marigold" onclick={() => store.rewatch(movie.id)}>{t('rewatch')}</button>
              <button
                class="px-2 py-1.5 text-crema/40 hover:text-rosa"
                onclick={() => confirm(t('confirmDelete', { title: movieTitle(movie) })) && store.removeMovie(movie.id)}
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>
