# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

BWNA (Beaumont-Wilshire Neighborhood Association) website — Astro 5 static site migrated from Wix. Deployed to GitHub Pages via GitHub Actions on push to `main`.

## Commands

- `npm run dev` — dev server at localhost:4321
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build
- No test suite or linter

## Key Conventions

- Content lives in `src/content/` as markdown with Zod-validated frontmatter (`src/content.config.ts`)
- All styles in `src/styles/global.css` using CSS custom properties
- No personal email addresses on the site. Markdown content is filtered at build time by `src/utils/rehype-redact-emails.mjs`: BWNA people's personal addresses (`BWNA_PEOPLE`) become a bwnapdx.org address (usually info@), outside organizations' public addresses are kept, and addresses at personal mail providers (`PERSONAL_DOMAINS`) or listed in `REMOVE` show as "[email removed]". Source markdown keeps the original text. In `.astro` pages, use bwnapdx.org addresses directly. After changing the plugin, delete `node_modules/.astro/data-store.json` so Astro re-renders cached markdown.
