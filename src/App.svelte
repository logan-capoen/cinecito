<script lang="ts">
  import Wishlist from './lib/Wishlist.svelte'
  import Planning from './lib/Planning.svelte'
  import Watched from './lib/Watched.svelte'
  import Login from './lib/Login.svelte'
  import { store } from './lib/store.svelte'
  import { i18n, t, type Lang } from './lib/i18n.svelte'

  type Tab = 'wishlist' | 'planning' | 'watched'
  let tab = $state<Tab>('wishlist')
  let preselected = $state<string | undefined>()

  function go(next: Tab) {
    tab = next
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function planMovie(id: string) {
    preselected = id
    go('planning')
  }

  const tabs = $derived([
    { id: 'wishlist' as const, label: t('tabWishlist'), emoji: '🍿', count: store.wishlist.length },
    { id: 'planning' as const, label: t('tabPlanning'), emoji: '📅', count: store.sessions.length },
    { id: 'watched' as const, label: t('tabWatched'), emoji: '✨', count: store.watched.length },
  ])

  const langs: [Lang, string][] = [
    ['es', '🇲🇽 ES'],
    ['fr', '🇫🇷 FR'],
  ]
</script>

<div class="mx-auto max-w-3xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:pb-24 sm:pt-6">
  <div class="mb-2 flex justify-end sm:mb-4">
    <div class="flex gap-1 rounded-full bg-white/5 p-1 text-sm">
      {#each langs as [code, label] (code)}
        <button
          class="rounded-full px-3 py-1 transition {i18n.lang === code ? 'bg-marigold font-semibold text-night' : 'text-crema/60 hover:text-crema'}"
          onclick={() => (i18n.lang = code)}
        >
          {label}
        </button>
      {/each}
    </div>
  </div>

  <header class="mb-6 text-center sm:mb-8">
    <div class="mb-1 text-4xl sm:mb-2 sm:text-5xl">🥖🎬🌮</div>
    <h1 class="font-display text-4xl font-bold tracking-tight sm:text-5xl">
      <span class="text-rosa">Cine</span><span class="text-marigold">cito</span>
    </h1>
    <p class="mt-1 font-display text-base italic text-crema/70 sm:mt-2 sm:text-lg">{t('subtitle')}</p>
  </header>

  {#if !store.authReady}
    <p class="text-center text-crema/50">{t('loading')}</p>
  {:else if !store.auth}
    <Login />
  {:else}
    {#if store.error}
      <div class="mb-4 flex items-center justify-between gap-3 rounded-xl border border-rosa/40 bg-rosa/10 px-4 py-2 text-sm text-rosa">
        <span>{t('oops')} : {store.error}</span>
        <button class="p-1" onclick={() => (store.error = null)}>✕</button>
      </div>
    {/if}

    <!-- Mobile : barre d'onglets fixée en bas (accessible au pouce) · Desktop : en haut -->
    <nav
      class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 gap-1 border-t border-white/10 bg-night/90 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-lg
        sm:static sm:mb-8 sm:gap-2 sm:rounded-2xl sm:border-0 sm:bg-white/5 sm:p-1.5 sm:backdrop-blur-none"
    >
      {#each tabs as item (item.id)}
        <button
          class="relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-xs font-medium transition
            sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5 sm:text-base
            {tab === item.id ? 'bg-rosa text-night shadow-lg shadow-rosa/30' : 'text-crema/70 hover:bg-white/5'}"
          onclick={() => go(item.id)}
        >
          <span class="text-xl sm:text-base">{item.emoji}</span>
          <span>{item.label}</span>
          {#if item.count}
            <span
              class="absolute right-2 top-1 rounded-full px-1.5 text-[10px] sm:static sm:text-xs
                {tab === item.id ? 'bg-night/20' : 'bg-white/10'}"
            >
              {item.count}
            </span>
          {/if}
        </button>
      {/each}
    </nav>

    <main>
      {#if tab === 'wishlist'}
        <Wishlist onplan={planMovie} />
      {:else if tab === 'planning'}
        <Planning bind:preselected />
      {:else}
        <Watched />
      {/if}
    </main>

    <footer class="mt-12 space-y-2 text-center text-sm text-crema/40 sm:mt-16">
      <p>{t('footer')}</p>
      <button class="p-2 underline-offset-4 hover:text-crema hover:underline" onclick={() => store.signOut()}>
        {t('signOut')}
      </button>
    </footer>
  {/if}
</div>
