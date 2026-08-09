import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// Keystatic's admin UI (/keystatic) needs server routes for the GitHub OAuth
// callback, and its client router hardcodes /keystatic — so it can't ship in
// the GitHub Pages build (static, served under /bwna-site/). It runs in two
// places instead, both served from '/':
//   - `astro dev` locally (local storage mode by default)
//   - the Cloudflare admin deploy: KEYSTATIC_ADMIN=1 astro build
// A plain `astro build` stays fully static for GitHub Pages, unchanged.
const isDev = process.argv.includes('dev');
const isAdminBuild = !!process.env.KEYSTATIC_ADMIN;
const withKeystatic = isDev || isAdminBuild;

// https://astro.build/config
export default defineConfig({
  site: 'https://bwnapdx.github.io',
  base: withKeystatic ? '/' : '/bwna-site/',
  adapter: isAdminBuild ? cloudflare() : undefined,
  integrations: [pagefind(), sitemap(), ...(withKeystatic ? [react(), keystatic()] : [])],
});
