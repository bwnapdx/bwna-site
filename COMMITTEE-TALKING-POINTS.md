# Communications Committee Presentation — April 2, 2026

## Opening: Why we're here

We've been exploring moving bwnapdx.org from Wix to a static site we control. Today I want to show you where we are, what's new, and get your input on the path forward.

**Live demo:** https://schavery.github.io/bwna-site/

---

## What's already working

Walk through the live site briefly:
- Homepage, About, Events, Resources, Get Involved — all rebuilt and current
- Mobile-responsive — pull it up on your phone
- Newsletter page with PDF archive back to 2023

## The big new thing: Newsletter articles as web content

This is the main pitch. Walk through these pages in order:

### 1. Show an article page
Go to: Newsletter > Current Issue > click "Reckoning with The Really Big One"

**Say:** "Right now, our newsletter articles are locked inside PDFs. On the new site, every article is its own web page — readable on your phone, shareable by link, and searchable."

Point out:
- Category badge (Safety)
- Author byline
- Full article text, properly formatted
- "Download complete issue (PDF)" link at the bottom — we still have the PDF
- "More from this issue" section showing sibling articles

### 2. Show the articles listing page
Go to: Newsletter > All Articles

**Say:** "Every article is browsable and filterable by category." Click a filter button to demonstrate.

### 3. Show search
Go to: the Search link in the navigation. Type "earthquake" or "volunteer."

**Say:** "Every article is instantly searchable. Imagine this with 14 years of content — that's where we're headed."

---

## The newsletter article pipeline

**This is the question people will ask: "Who does this? How does it work?"**

### How a new issue gets published (every 2 months):

1. Susan produces the newsletter PDF in InDesign — **nothing changes for her**
2. A website volunteer (me, for now) drops the PDF into the system
3. An automated script reads each page, identifies each article, and creates the web version — powered by AI, costs about 10 cents per issue
4. Volunteer does a quick review — 5 to 10 minutes of proofreading
5. Push to publish — the site rebuilds automatically

**Total effort per issue: 15–20 minutes, every two months.**

### The back catalog

- We have every newsletter PDF URL going back to January 2012 — 84 issues
- The same script can process all of them in one batch for about $10 total
- Recent issues (2023–present) get a close review
- Older issues have a "view original PDF" link as a fallback if the automated extraction isn't perfect

### If someone asks about the InDesign source text

Worth checking with Susan: if she can share article text before or alongside the PDF, we can skip the automated extraction entirely for new issues and just paste the text in. Even faster.

---

## Email subscriptions

- The Mailchimp signup form from the old site is now embedded directly — same list, same account, no change for subscribers
- We can also capture the monthly Community Update emails as web content (more on this below if there's interest)

---

## Community Updates (the monthly email)

Currently the Community Update goes out via Mailchimp monthly with events and announcements. Proposal:

- When each Community Update is sent, also publish it as a web page on the site
- This gives it a permanent, searchable URL
- People who miss the email (or aren't subscribed) can still find the info
- Over time, builds a searchable archive of community announcements
- **Effort: minimal — copy the email content into a markdown file**

---

## What this costs

| Item | Cost |
|------|------|
| Hosting (GitHub Pages) | Free |
| Domain (bwnapdx.org, when ready) | ~$12/year |
| Mailchimp (free tier, up to 500 contacts) | Free |
| Back-catalog processing (one-time) | ~$10 |
| Per-issue processing | ~$0.10 |
| Ongoing maintenance | $0/month |
| **vs. Wix** | **Whatever we're paying now** |

---

## What we need from the committee

1. **Go/no-go** on continuing this direction
2. **Domain timing** — when (if ever) do we point bwnapdx.org at the new site?
3. **Community Updates** — do we want to archive them on the site?
4. **Volunteers** — who else besides me is willing to help with the 15-min-per-issue workflow?

---

## What's next if we proceed

| Phase | Timeline | What happens |
|-------|----------|-------------|
| Now | Already done | 7 demo articles, search, Mailchimp form |
| Phase 1 | 2–3 weeks | Download all 84 PDFs, process full archive, ~1,680 articles |
| Phase 2 | When ready | Point bwnapdx.org domain to new site |
| Ongoing | Every 2 months | 15-min publish workflow per newsletter issue |
