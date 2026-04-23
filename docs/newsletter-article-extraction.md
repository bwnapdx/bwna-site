# Newsletter Article Extraction Process

## Overview

Each bimonthly BWNA newsletter PDF contains 10-18 articles that need to be extracted into individual markdown files for the website's content collection. This is a manual process done with Claude Code.

## Process (per issue, ~15 minutes)

### 1. Convert PDF to page images

```bash
mkdir -p /tmp/bwna-pages
pdftoppm -jpeg -r 200 public/newsletters/bwna-YYYY-MM.pdf /tmp/bwna-pages/YYYY-MM
```

### 2. Read the cover page to identify articles

The cover page (page 1) has an "IN THIS ISSUE" table of contents listing all articles with page numbers.

### 3. Read all pages visually

Use Claude Code's Read tool on each page image. Skip ads-only pages. For each article, note:
- Title
- Author (if bylined)
- Page number
- Category (see categories below)
- Whether it's a featured/lead article

### 4. Write markdown files

Create files in `src/content/newsletters/` following the naming convention:

```
YYYY-MM-slug-from-title.md
```

Each file needs this frontmatter:

```yaml
---
title: "Article Title"
issue: "Nov-Dec 2025"       # Display name
issueSlug: "2025-11"        # First month of bimonthly period
author: "Author Name"       # Optional - omit if no byline
date: 2025-11-01            # First day of issue month
category: "community-news"  # See categories below
featured: false             # true for lead/cover stories
page: 5                     # Page number in PDF
pdfFile: "bwna-2025-11.pdf" # PDF filename
---

Article body in markdown...
```

### 5. Build and verify

```bash
npm run build
```

Check that the new articles appear in the build output and the page count increases.

## Categories

| Slug | Label |
|------|-------|
| `presidents-message` | President's Message |
| `community-news` | Community News |
| `land-use` | Land Use |
| `parks` | Parks |
| `safety` | Safety |
| `schools` | Schools |
| `business` | Business |
| `events` | Events |
| `history` | History |
| `environment` | Environment |
| `opinion` | Opinion |
| `announcements` | Announcements |
| `volunteer` | Volunteer |
| `other` | Other |

## Issue naming convention

| Issue dates | issueSlug | pdfFile |
|------------|-----------|---------|
| Jan-Feb 2025 | `2025-01` | `bwna-2025-01.pdf` |
| Mar-Apr 2025 | `2025-03` | `bwna-2025-03.pdf` |
| May-Jun 2025 | `2025-05` | `bwna-2025-05.pdf` |
| Jul-Aug 2025 | `2025-07` | `bwna-2025-07.pdf` |
| Sep-Oct 2025 | `2025-09` | `bwna-2025-09.pdf` |
| Nov-Dec 2025 | `2025-11` | `bwna-2025-11.pdf` |

## Progress tracker

All 85 issues extracted (1,095 articles) via `scripts/extract-articles.mjs` on 2026-04-23 using the Anthropic API + Sonnet 4.6.

First pass (image-based, Batch API) extracted 82 issues. Three issues (2014-03, 2025-01, 2025-09) repeatedly tripped Anthropic's output content filter. They succeeded on a retry using direct-PDF input + a softer prompt that established BWNA's ownership of the content.

## Bulk extraction script

The automated extraction lives in `scripts/extract-articles.mjs`. Usage:

```bash
# Pilot one issue (sync, image mode):
node scripts/extract-articles.mjs --issues=2024-11

# Direct-PDF mode (use this if image mode trips the output filter):
node scripts/extract-articles.mjs --issues=2014-03 --pdf

# All un-extracted issues via Batch API (splits into 25-issue chunks):
node scripts/extract-articles.mjs --batch --all

# Resume a running batch:
node scripts/extract-articles.mjs --poll=msgbatch_XXX
```

Requires `ANTHROPIC_API_KEY` in `.env` (gitignored).

## Tips

- **Skip ads-only pages** — don't create articles for full-page advertisements
- **Author bios** at the end of articles (usually in italics) can be included as the last paragraph
- **Blockquotes** — use `>` for pulled quotes
- **Sub-articles** on the same page (like News Bits) can be one article with `##` subheadings
- **The "Get Involved" page** is usually a single article even though it has multiple call-outs
- **Recipes** — preserve ingredient lists and instructions with proper markdown formatting
