<script lang="ts">
  import { t } from './i18n.svelte'
  import { searchMovies, posterUrl, type TmdbMovie } from './tmdb'

  let { onpick }: { onpick: (movie: TmdbMovie | null, rawTitle: string) => void } = $props()

  let query = $state('')
  let results = $state<TmdbMovie[]>([])
  let open = $state(false)
  let active = $state(-1)
  let searching = $state(false)

  let timer: ReturnType<typeof setTimeout>
  let controller: AbortController | null = null

  function onInput() {
    clearTimeout(timer)
    active = -1
    const q = query.trim()
    if (q.length < 2) {
      results = []
      open = false
      return
    }
    timer = setTimeout(async () => {
      controller?.abort()
      controller = new AbortController()
      searching = true
      try {
        results = await searchMovies(q, controller.signal)
        open = true
      } catch (e) {
        if ((e as Error).name !== 'AbortError') results = []
      } finally {
        searching = false
      }
    }, 300)
  }

  function pick(movie: TmdbMovie | null) {
    const raw = query.trim()
    if (!movie && !raw) return
    onpick(movie, raw)
    query = ''
    results = []
    open = false
    active = -1
  }

  function onKeydown(e: KeyboardEvent) {
    // Les résultats + l'option « sans fiche » à la fin
    const total = results.length + 1
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      open = true
      active = (active + 1) % total
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      active = (active - 1 + total) % total
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (active >= 0 && active < results.length) pick(results[active])
      else if (active === results.length) pick(null)
      else if (results.length) pick(results[0])
    } else if (e.key === 'Escape') {
      open = false
    }
  }
</script>

<div class="relative">
  <input
    class="w-full !py-3 !text-lg"
    placeholder={t('searchPlaceholder')}
    bind:value={query}
    oninput={onInput}
    onkeydown={onKeydown}
    onfocus={() => results.length && (open = true)}
    onblur={() => setTimeout(() => (open = false), 150)}
    role="combobox"
    aria-expanded={open}
    aria-controls="movie-results"
    aria-autocomplete="list"
    autocomplete="off"
  />
  {#if searching}
    <span class="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-crema/50">⏳</span>
  {/if}

  {#if open && query.trim().length >= 2}
    <ul
      id="movie-results"
      role="listbox"
      class="absolute z-20 mt-2 max-h-[50dvh] sm:max-h-[26rem] w-full overflow-y-auto rounded-2xl border border-white/10 bg-velvet p-1.5 shadow-2xl"
    >
      {#each results as movie, i (movie.id)}
        {@const src = posterUrl(movie.poster_path, 'w92')}
        <li role="option" aria-selected={active === i}>
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition {active === i ? 'bg-rosa/20' : 'hover:bg-white/5'}"
            onmousedown={(e) => e.preventDefault()}
            onclick={() => pick(movie)}
            onmouseenter={() => (active = i)}
          >
            {#if src}
              <img {src} alt="" class="h-14 w-10 shrink-0 rounded object-cover" />
            {:else}
              <div class="flex h-14 w-10 shrink-0 items-center justify-center rounded bg-white/10">🎬</div>
            {/if}
            <div class="min-w-0">
              <p class="truncate font-medium">{movie.title}</p>
              {#if movie.release_date}
                <p class="text-sm text-crema/50">{movie.release_date.slice(0, 4)}</p>
              {/if}
            </div>
          </button>
        </li>
      {:else}
        {#if !searching}
          <li class="px-3 py-2 text-sm text-crema/50">{t('noResults')}</li>
        {/if}
      {/each}
      <li role="option" aria-selected={active === results.length}>
        <button
          type="button"
          class="w-full rounded-xl px-3 py-2 text-left text-sm text-crema/60 transition {active === results.length ? 'bg-rosa/20' : 'hover:bg-white/5'}"
          onmousedown={(e) => e.preventDefault()}
          onclick={() => pick(null)}
          onmouseenter={() => (active = results.length)}
        >
          + {t('addWithoutInfo', { title: query.trim() })}
        </button>
      </li>
    </ul>
  {/if}
</div>
