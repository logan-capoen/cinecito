<script lang="ts">
  import { posterUrl } from './tmdb'

  let { path, title, class: cls = 'w-16' }: { path: string | null; title: string; class?: string } = $props()
  const src = $derived(posterUrl(path, 'w185'))
</script>

{#if src}
  <img {src} alt="Affiche de {title}" loading="lazy" class="{cls} aspect-[2/3] shrink-0 rounded-lg object-cover shadow-lg" />
{:else}
  <div class="{cls} flex aspect-[2/3] shrink-0 items-center justify-center rounded-lg bg-white/10 text-2xl">🎬</div>
{/if}
