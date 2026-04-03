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

| Issue | Status | Articles |
|-------|--------|----------|
| Jan-Feb 2026 | Done | 17 |
| Nov-Dec 2025 | Done | 17 |
| Sep-Oct 2025 | Not started | |
| Jul-Aug 2025 | Not started | |
| May-Jun 2025 | Not started | |
| Mar-Apr 2025 | Not started | |
| Jan-Feb 2025 | Not started | |
| 2024 (6 issues) | Not started | |
| 2023 (6 issues) | Not started | |
| 2022 (6 issues) | Not started | |
| 2021 (6 issues) | Not started | |
| 2020 (6 issues) | Not started | |
| 2019 (6 issues) | Not started | |
| 2018 (6 issues) | Not started | |
| 2017 (6 issues) | Not started | |
| 2016 (6 issues) | Not started | |
| 2015 (6 issues) | Not started | |
| 2014 (6 issues) | Not started | |
| 2013 (6 issues) | Not started | |
| 2012 (6 issues) | Not started | |

## Tips

- **Skip ads-only pages** — don't create articles for full-page advertisements
- **Author bios** at the end of articles (usually in italics) can be included as the last paragraph
- **Blockquotes** — use `>` for pulled quotes
- **Sub-articles** on the same page (like News Bits) can be one article with `##` subheadings
- **The "Get Involved" page** is usually a single article even though it has multiple call-outs
- **Recipes** — preserve ingredient lists and instructions with proper markdown formatting
