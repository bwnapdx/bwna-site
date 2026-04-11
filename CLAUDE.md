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
