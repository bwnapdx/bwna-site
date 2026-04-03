import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://schavery.github.io',
  base: '/bwna-site/',
  integrations: [pagefind(), sitemap()],
});
