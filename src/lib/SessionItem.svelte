<script lang="ts">
  import { t } from './i18n.svelte'
  import { store, formatDateTime, isPast, movieTitle, type Session } from './store.svelte'
  import Poster from './Poster.svelte'

  let { session }: { session: Session } = $props()

  const m = $derived(store.movie(session.movie_id))
  const past = $derived(isPast(session.starts_at))
  let rating = $state(0)
  let rating_open = $state(false)

  function confirmValidate() {
    store.validate(session, rating || undefined)
    rating_open = false
  }
</script>

<li class="rounded-2xl border p-3 {past ? 'border-marigold/40 bg-marigold/5' : 'border-white/10 bg-white/5'}">
  <div class="flex items-center gap-4">
    <Poster path={m?.poster_path ?? null} title={movieTitle(m)} class="w-12 sm:w-14" />
    <div class="min-w-0 flex-1">
      <p class="text-sm first-letter:uppercase {past ? 'text-marigold' : 'text-verde'}">{formatDateTime(session.starts_at)}</p>
      <p class="truncate font-semibold">{m ? movieTitle(m) : t('deletedMovie')}</p>
      {#if !rating_open}
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            class="rounded-xl bg-verde px-3 py-2 text-sm font-semibold text-night transition hover:brightness-110"
            onclick={() => {
              rating = 0
              rating_open = true
            }}
          >
            {t('seen')}
          </button>
          <button
            class="rounded-xl border border-white/15 px-3 py-2 text-sm text-crema/70 transition hover:border-rosa hover:text-rosa"
            title={t('notSeenTitle')}
            onclick={() => store.cancel(session)}
          >
            {t('notSeen')}
          </button>
        </div>
      {/if}
    </div>
  </div>

  {#if rating_open}
    <div class="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
      <div class="flex items-center gap-1">
        <span class="mr-2 text-sm text-crema/60">{t('rating')}</span>
        {#each [1, 2, 3, 4, 5] as n (n)}
          <button
            class="text-2xl transition {n <= rating ? '' : 'opacity-25 grayscale'} hover:scale-110"
            onclick={() => (rating = rating === n ? 0 : n)}
          >
            🌮
          </button>
        {/each}
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-1.5 text-sm text-crema/60 hover:text-crema" onclick={() => (rating_open = false)}>
          {t('cancel')}
        </button>
        <button
          class="rounded-xl bg-verde px-4 py-1.5 text-sm font-semibold text-night transition hover:brightness-110"
          onclick={confirmValidate}
        >
          {t('validate')}
        </button>
      </div>
    </div>
  {/if}
</li>
