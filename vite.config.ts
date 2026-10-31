import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages sert le site sous https://logan-capoen.github.io/cinecito/
  base: process.env.GITHUB_ACTIONS ? '/cinecito/' : '/',
  plugins: [tailwindcss(), svelte()],
})
