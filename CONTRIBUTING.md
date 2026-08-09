# Contributing to the BWNA Website

This guide is written for volunteers who may have never edited a website before. **If you can write an email, you can update this website.**

## The Big Picture

This website works differently than Wix or WordPress:

| Old Way (Wix/WordPress) | Our Way (Static Site) |
|------------------------|----------------------|
| Log into a website | Edit text files |
| Click buttons in an editor | Write in a simple format called Markdown |
| Changes happen instantly | Changes go live in ~1 minute after saving |
| Need to remember a password | Use your GitHub account |

**Why is this better?**
- It's free (no subscription fees)
- It's faster for visitors
- It can never be hacked (no database)
- AI tools can help you easily
- Everything is backed up automatically

---

## What is Markdown?

Markdown is a way to format text using simple symbols. Here's everything you need to know:

```markdown
# Big Heading
## Smaller Heading
### Even Smaller Heading

Regular paragraph text just flows naturally.
Leave a blank line between paragraphs.

**Bold text** uses two asterisks
*Italic text* uses one asterisk

- Bullet point
- Another bullet
- Third bullet

1. Numbered list
2. Second item
3. Third item

[Link text](https://example.com)

![Image description](image-filename.jpg)
```

That's it! That's 90% of what you'll ever need.

---

## How to Add an Event (Step by Step)

### Option A: Using GitHub's Web Editor (Easiest)

1. Go to https://github.com/bwnapdx/bwna-site (or wherever the repo lives)
2. Navigate to `src/content/events/`
3. Click "Add file" → "Create new file"
4. Name it something like `2026-04-15-earth-day-cleanup.md`
5. Paste this template and fill it in:

```markdown
---
title: "Earth Day Park Cleanup"
date: 2026-04-15
time: "10:00 AM - 1:00 PM"
location: "Wilshire Park"
type: "community"
---

Join us for our annual Earth Day celebration! We'll be planting 
flowers, picking up litter, and enjoying our beautiful park.

All ages welcome. Light refreshments provided.
```

6. Scroll down and click "Commit new file"
7. Done! The website rebuilds automatically in about 1 minute.

### Option B: Using AI Assistance

1. Send Claude (or ChatGPT) the event details in any format:
   > "Can you format this as a website event? Spring Cleanup, April 15 2026, 10am to 1pm at Wilshire Park, community event about Earth Day..."

2. The AI will give you properly formatted content
3. Copy it to GitHub as described above

---

## How to Add Newsletter Content

Instead of just posting PDFs, we can also publish articles as web pages (better for searching and reading on phones).

### Creating a Newsletter Article

1. Go to `src/content/newsletters/`
2. Create a file like `2026-01-presidents-message.md`
3. Use this format:

```markdown
---
title: "President's Message: Looking Ahead to 2026"
issue: "Jan-Feb 2026"
author: "Al Ellis"
date: 2026-01-01
---

Fellow neighbors,

As we begin a new year, I want to reflect on what we accomplished 
together in 2025 and share my hopes for the months ahead.

## Our Accomplishments

Last year, BWNA volunteers:
- Delivered over 15,000 newsletters
- Hosted 6 community events
- Planted 50 trees in Wilshire Park

## Looking Forward

In 2026, we're planning...
```

### Still Want the PDF Too?

Absolutely! Put PDF files in `public/newsletters/` and link to them:

```markdown
[Download the full newsletter (PDF)](/newsletters/2026-jan-feb.pdf)
```

---

## How to Update Existing Pages

### Fixing a Typo or Small Change

1. Find the file on GitHub (pages are in `src/pages/`)
2. Click the pencil icon to edit
3. Make your change
4. Commit

### Updating Board Member Info

1. Open `src/pages/about.astro`
2. Find the `boardMembers` list (around line 5)
3. Edit the relevant entry or add a new one
4. Commit

---

## Adding Images

1. Put your image in `public/images/`
2. Reference it in your content:

```markdown
![Description of image](/images/your-image.jpg)
```

**Tips:**
- Use descriptive filenames: `2026-spring-cleanup-group.jpg` not `IMG_4521.jpg`
- Resize large photos before uploading (1200px wide is plenty)
- JPG for photos, PNG for graphics/logos

---

## The Frontmatter Explained

The stuff between `---` marks at the top of files is called "frontmatter." It's metadata about the content:

```markdown
---
title: "Event Title"      # Required - shows as the heading
date: 2026-04-15          # Required - format: YYYY-MM-DD  
time: "10:00 AM"          # When it happens
location: "Wilshire Park" # Where it happens
type: "community"         # Options: meeting, community, social
---
```

The frontmatter must be at the very top of the file, and the `---` markers are required.

---

## Getting Help

### From AI
Copy your question and any relevant code into Claude or ChatGPT. Because our site is just text files, AI can understand and help with almost anything:

> "I'm trying to add an event but the date isn't showing up. Here's my file: [paste content]"

### From Other Volunteers
- Ask in the Communications Committee meeting
- Email: editor@bwnapdx.org
- Open a GitHub issue

### Common Mistakes

| Problem | Solution |
|---------|----------|
| Changes not showing up | Wait 1-2 minutes for rebuild, then hard refresh (Ctrl+Shift+R) |
| Page looks broken | Check that frontmatter has `---` on both top and bottom |
| Date shows wrong | Use format YYYY-MM-DD (2026-04-15, not April 15, 2026) |
| Image not showing | Check filename matches exactly (case sensitive!) |

---

## You've Got This!

Remember:
- You can't break anything permanently (we can always undo)
- Every change is saved in history
- When in doubt, ask for help
- The more you do it, the easier it gets

Welcome to the team! 🎉
