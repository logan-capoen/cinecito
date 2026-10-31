<script lang="ts">
  import { t } from './i18n.svelte'
  import { store, dayKey, formatDateTime, isPast, movieTitle } from './store.svelte'
  import Calendar from './Calendar.svelte'
  import SessionItem from './SessionItem.svelte'

  let { preselected = $bindable() }: { preselected?: string } = $props()

  let selected = $state(dayKey(new Date()))
  let movieId = $state('')
  let time = $state('20:30')

  // On consomme la présélection venant de « Por ver »
  $effect(() => {
    if (preselected) {
      movieId = preselected
      preselected = undefined
    }
  })

  const daySessions = $derived(store.upcoming.filter((s) => dayKey(s.starts_at) === selected))
  const toValidate = $derived(store.upcoming.filter((s) => isPast(s.starts_at)))
  const upcoming = $derived(store.upcoming.filter((s) => !isPast(s.starts_at)))

  async function submit(e: SubmitEvent) {
    e.preventDefault()
    if (!movieId || !time) return
    await store.plan(movieId, new Date(`${selected}T${time}`))
    movieId = ''
  }
</script>

<section class="space-y-6">
  {#if toValidate.length}
    <div class="space-y-3">
      <h3 class="font-display text-lg font-semibold text-marigold">{t('toValidate')}</h3>
      <ul class="space-y-3">
        {#each toValidate as s (s.id)}<SessionItem session={s} />{/each}
      </ul>
    </div>
  {/if}

  <Calendar bind:selected />

  <div class="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
    <h3 class="font-display text-lg font-semibold first-letter:uppercase">
      {formatDateTime(`${selected}T12:00`, false)}
    </h3>

    {#if daySessions.length}
      <ul class="space-y-3">
        {#each daySessions as s (s.id)}<SessionItem session={s} />{/each}
      </ul>
    {:else}
      <p class="text-sm text-crema/50">{t('noSessionDay')}</p>
    {/if}

    {#if store.wishlist.length === 0}
      <p class="text-sm text-crema/60">{t('addFirst')}</p>
    {:else}
      <form onsubmit={submit} class="flex flex-wrap gap-2 border-t border-white/10 pt-3">
        <select class="w-full min-w-0 sm:w-auto sm:flex-1" bind:value={movieId} required>
          <option value="" disabled>{t('pickMovie')}</option>
          {#each store.wishlist as m (m.id)}
            <option value={m.id}>{movieTitle(m)}{m.year ? ` (${m.year})` : ''}</option>
          {/each}
        </select>
        <input type="time" class="min-w-0 flex-1 sm:w-28 sm:flex-none" bind:value={time} required />
        <button class="rounded-xl bg-rosa px-5 py-2.5 font-semibold text-night transition hover:brightness-110">🎬 +</button>
      </form>
    {/if}
  </div>

  <div class="space-y-3">
    <h3 class="font-display text-lg font-semibold">{t('upcoming')}</h3>
    {#if upcoming.length}
      <ul class="space-y-3">
        {#each upcoming as s (s.id)}<SessionItem session={s} />{/each}
      </ul>
    {:else}
      <p class="text-sm text-crema/50">{t('noUpcoming')}</p>
    {/if}
  </div>
</section>
