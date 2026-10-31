<script lang="ts">
  import { t } from './i18n.svelte'
  let { text }: { text: string | null } = $props()
  let open = $state(false)
</script>

{#if text}
  <button
    type="button"
    class="text-left text-sm leading-snug text-crema/60 {open ? '' : 'line-clamp-3'}"
    onclick={() => (open = !open)}
    title={open ? t('readLess') : t('readMore')}
  >
    {text}
  </button>
{/if}
