<script lang="ts">
  import { i18n, t } from './i18n.svelte'
  import { store, dayKey, movieTitle } from './store.svelte'
  import { posterUrl } from './tmdb'

  let { selected = $bindable() }: { selected: string } = $props()

  const todayKey = dayKey(new Date())
  let cursor = $state(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  const monthLabel = $derived(cursor.toLocaleDateString(i18n.locale, { month: 'long', year: 'numeric' }))

  // Lundi en premier
  const weekdays = $derived(
    Array.from({ length: 7 }, (_, i) =>
      new Date(2024, 0, 1 + i).toLocaleDateString(i18n.locale, { weekday: 'short' }).replace('.', ''),
    ),
  )

  const days = $derived.by(() => {
    const first = new Date(cursor)
    const offset = (first.getDay() + 6) % 7
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset)
    const weeks = Math.ceil((offset + new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()) / 7)
    return Array.from({ length: weeks * 7 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
      return { date: d, key: dayKey(d), inMonth: d.getMonth() === first.getMonth() }
    })
  })

  const byDay = $derived.by(() => {
    const map = new Map<string, typeof store.sessions>()
    for (const s of store.upcoming) {
      const k = dayKey(s.starts_at)
      map.set(k, [...(map.get(k) ?? []), s])
    }
    return map
  })

  function move(delta: number) {
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1)
  }

  // Glisser à gauche / à droite sur mobile pour changer de mois
  let touchX: number | null = null
  function onTouchStart(e: TouchEvent) {
    touchX = e.touches[0].clientX
  }
  function onTouchEnd(e: TouchEvent) {
    if (touchX === null) return
    const dx = e.changedTouches[0].clientX - touchX
    touchX = null
    if (Math.abs(dx) > 60) move(dx < 0 ? 1 : -1)
  }

  function goToday() {
    cursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    selected = todayKey
  }
</script>

<div
  class="rounded-2xl border border-white/10 bg-velvet/60 p-2.5 sm:p-4"
  ontouchstart={onTouchStart}
  ontouchend={onTouchEnd}
  role="group"
>
  <div class="mb-3 flex items-center justify-between">
    <button class="rounded-lg px-4 py-2 text-2xl leading-none hover:bg-white/10" onclick={() => move(-1)} aria-label="←">‹</button>
    <div class="flex items-center gap-3">
      <h2 class="font-display text-lg font-semibold first-letter:uppercase sm:text-xl">{monthLabel}</h2>
      <button class="rounded-full border border-white/15 px-2.5 py-0.5 text-xs text-crema/70 hover:border-marigold hover:text-marigold" onclick={goToday}>
        {t('today')}
      </button>
    </div>
    <button class="rounded-lg px-4 py-2 text-2xl leading-none hover:bg-white/10" onclick={() => move(1)} aria-label="→">›</button>
  </div>

  <div class="grid grid-cols-7 gap-0.5 text-center text-[10px] uppercase tracking-wide text-crema/40 sm:gap-1 sm:text-xs">
    {#each weekdays as w (w)}<div class="py-1">{w}</div>{/each}
  </div>

  <div class="grid grid-cols-7 gap-0.5 sm:gap-1">
    {#each days as d (d.key)}
      {@const sessions = byDay.get(d.key) ?? []}
      {@const isSelected = d.key === selected}
      {@const isToday = d.key === todayKey}
      <button
        class="relative flex aspect-square flex-col items-center justify-start overflow-hidden rounded-xl p-1 text-sm transition sm:aspect-[4/5]
          {isSelected ? 'bg-rosa text-night' : sessions.length ? 'bg-marigold/15 hover:bg-marigold/25' : 'hover:bg-white/10'}
          {d.inMonth ? '' : 'opacity-35'}"
        onclick={() => (selected = d.key)}
      >
        <span class="leading-none {isToday && !isSelected ? 'rounded-full bg-verde px-1.5 py-0.5 font-bold text-night' : 'py-0.5'}">
          {d.date.getDate()}
        </span>
        {#if sessions.length}
          {@const m = store.movie(sessions[0].movie_id)}
          {@const src = posterUrl(m?.poster_path, 'w92')}
          {#if src}
            <img {src} alt={movieTitle(m)} class="mt-1 hidden min-h-0 w-3/5 flex-1 rounded object-cover sm:block" />
          {/if}
          <span class="mt-auto text-xs sm:hidden">🎬</span>
          {#if sessions.length > 1}
            <span class="absolute right-1 top-1 rounded-full bg-night/60 px-1 text-[10px] text-crema">+{sessions.length - 1}</span>
          {/if}
        {/if}
      </button>
    {/each}
  </div>
</div>
