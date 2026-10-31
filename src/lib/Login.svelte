<script lang="ts">
  import { store } from './store.svelte'
  import { t } from './i18n.svelte'

  let password = $state('')
  let error = $state<string | null>(null)
  let busy = $state(false)

  async function submit(e: SubmitEvent) {
    e.preventDefault()
    busy = true
    error = await store.signIn(password)
    busy = false
    if (error) error = t('loginError')
  }
</script>

<form onsubmit={submit} class="mx-auto max-w-sm space-y-3 rounded-2xl border border-white/10 bg-velvet/60 p-6">
  <h2 class="text-center font-display text-xl font-semibold">{t('loginTitle')}</h2>
  <input
    class="w-full"
    type="password"
    placeholder={t('password')}
    autocomplete="current-password"
    bind:value={password}
    required
  />
  {#if error}<p class="text-sm text-rosa">{error}</p>{/if}
  <button
    class="w-full rounded-xl bg-rosa px-5 py-2 font-semibold text-night transition hover:brightness-110 disabled:opacity-50"
    disabled={busy}
  >
    {busy ? '…' : t('enter')}
  </button>
</form>
