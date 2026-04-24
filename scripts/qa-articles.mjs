#!/usr/bin/env node
// Spot-check auto-extracted newsletter articles for likely extraction problems.
// Writes a triage report to qa-report.md so you can skim flagged articles
// instead of reading all ~1,100 by hand.
//
// Usage: node scripts/qa-articles.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(REPO_ROOT, 'src/content/newsletters');
const REPORT_PATH = path.join(REPO_ROOT, 'qa-report.md');

const SHORT_BODY_CHARS = 200;
const LONG_TITLE_CHARS = 120;
const LOW_ARTICLES_PER_ISSUE = 4;
const HIGH_ARTICLES_PER_ISSUE = 30;

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: raw };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let [, k, v] = kv;
    v = v.trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (v === 'true') v = true;
    else if (v === 'false') v = false;
    else if (/^\d+$/.test(v)) v = Number(v);
    fm[k] = v;
  }
  return { frontmatter: fm, body: m[2] };
}

function looksLikeOcrGarbage(body) {
  const tokens = body.split(/\s+/).filter(Boolean);
  if (tokens.length < 20) return false;
  const shortTokens = tokens.filter((t) => t.length <= 2).length;
  return shortTokens / tokens.length > 0.35;
}

function hasContinuationStub(body) {
  return /continued (on|from) page/i.test(body);
}

const files = fs
  .readdirSync(ARTICLES_DIR)
  .filter((f) => f.endsWith('.md'))
  .sort();

const articles = files.map((file) => {
  const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8');
  const { frontmatter, body } = parseFrontmatter(raw);
  return { file, frontmatter, body: body.trim() };
});

const flags = {
  missingTitle: [],
  emptyBody: [],
  shortBody: [],
  longTitle: [],
  duplicateTitleInIssue: [],
  duplicateBodyInIssue: [],
  ocrGarbage: [],
  continuationStub: [],
  missingPageOrPdf: [],
};

// Per-article checks
for (const a of articles) {
  const { file, frontmatter: fm, body } = a;
  if (!fm.title) flags.missingTitle.push(a);
  if (body.length === 0) flags.emptyBody.push(a);
  else if (body.length < SHORT_BODY_CHARS) flags.shortBody.push(a);
  if (fm.title && fm.title.length > LONG_TITLE_CHARS) flags.longTitle.push(a);
  if (looksLikeOcrGarbage(body)) flags.ocrGarbage.push(a);
  if (hasContinuationStub(body)) flags.continuationStub.push(a);
  if (!fm.page || !fm.pdfFile) flags.missingPageOrPdf.push(a);
}

// Duplicate detection within the same issue
const byIssue = new Map();
for (const a of articles) {
  const key = a.frontmatter.issueSlug || 'unknown';
  if (!byIssue.has(key)) byIssue.set(key, []);
  byIssue.get(key).push(a);
}

for (const [issue, list] of byIssue) {
  const titleMap = new Map();
  const bodyMap = new Map();
  for (const a of list) {
    const t = (a.frontmatter.title || '').trim().toLowerCase();
    if (t) {
      if (!titleMap.has(t)) titleMap.set(t, []);
      titleMap.get(t).push(a);
    }
    const b = a.body.slice(0, 200).toLowerCase();
    if (b) {
      if (!bodyMap.has(b)) bodyMap.set(b, []);
      bodyMap.get(b).push(a);
    }
  }
  for (const [, group] of titleMap) {
    if (group.length > 1) flags.duplicateTitleInIssue.push({ issue, group });
  }
  for (const [, group] of bodyMap) {
    if (group.length > 1) flags.duplicateBodyInIssue.push({ issue, group });
  }
}

// Issues with suspicious article counts
const issueCounts = [...byIssue.entries()]
  .map(([issue, list]) => ({ issue, count: list.length }))
  .sort((a, b) => a.issue.localeCompare(b.issue));

const lowCountIssues = issueCounts.filter((i) => i.count <= LOW_ARTICLES_PER_ISSUE);
const highCountIssues = issueCounts.filter((i) => i.count >= HIGH_ARTICLES_PER_ISSUE);

// Build the report
const lines = [];
lines.push('# Newsletter article QA report\n');
lines.push(`Generated: ${new Date().toISOString()}\n`);
lines.push(`Scanned **${articles.length}** articles across **${byIssue.size}** issues.\n`);

lines.push('## Summary\n');
lines.push('| Check | Count |');
lines.push('| --- | ---: |');
lines.push(`| Missing title | ${flags.missingTitle.length} |`);
lines.push(`| Empty body | ${flags.emptyBody.length} |`);
lines.push(`| Short body (<${SHORT_BODY_CHARS} chars) | ${flags.shortBody.length} |`);
lines.push(`| Overly long title (>${LONG_TITLE_CHARS} chars) | ${flags.longTitle.length} |`);
lines.push(`| Duplicate title within issue | ${flags.duplicateTitleInIssue.length} groups |`);
lines.push(`| Duplicate body within issue | ${flags.duplicateBodyInIssue.length} groups |`);
lines.push(`| OCR-garbage-looking body | ${flags.ocrGarbage.length} |`);
lines.push(`| Continuation stub ("continued on page") | ${flags.continuationStub.length} |`);
lines.push(`| Missing page or pdfFile | ${flags.missingPageOrPdf.length} |`);
lines.push(`| Issues with ≤${LOW_ARTICLES_PER_ISSUE} articles | ${lowCountIssues.length} |`);
lines.push(`| Issues with ≥${HIGH_ARTICLES_PER_ISSUE} articles | ${highCountIssues.length} |`);
lines.push('');

function renderList(title, items, render) {
  if (items.length === 0) return;
  lines.push(`## ${title} (${items.length})\n`);
  for (const item of items) lines.push(render(item));
  lines.push('');
}

renderList('Missing title', flags.missingTitle, (a) => `- \`${a.file}\``);
renderList('Empty body', flags.emptyBody, (a) => `- \`${a.file}\` — "${a.frontmatter.title || ''}"`);
renderList('Short body', flags.shortBody, (a) =>
  `- \`${a.file}\` — ${a.body.length} chars — "${a.frontmatter.title || ''}"`
);
renderList('Overly long title', flags.longTitle, (a) =>
  `- \`${a.file}\` — ${(a.frontmatter.title || '').length} chars: "${a.frontmatter.title}"`
);

if (flags.duplicateTitleInIssue.length) {
  lines.push(`## Duplicate title within issue (${flags.duplicateTitleInIssue.length} groups)\n`);
  for (const { issue, group } of flags.duplicateTitleInIssue) {
    lines.push(`- **${issue}** — "${group[0].frontmatter.title}"`);
    for (const a of group) lines.push(`  - \`${a.file}\``);
  }
  lines.push('');
}

if (flags.duplicateBodyInIssue.length) {
  lines.push(`## Duplicate body within issue (${flags.duplicateBodyInIssue.length} groups)\n`);
  for (const { issue, group } of flags.duplicateBodyInIssue) {
    lines.push(`- **${issue}** — ${group.length} articles share opening body text`);
    for (const a of group) lines.push(`  - \`${a.file}\` — "${a.frontmatter.title}"`);
  }
  lines.push('');
}

renderList('OCR-garbage-looking body', flags.ocrGarbage, (a) => `- \`${a.file}\` — "${a.frontmatter.title}"`);
renderList('Continuation stub', flags.continuationStub, (a) => `- \`${a.file}\` — "${a.frontmatter.title}"`);
renderList('Missing page or pdfFile', flags.missingPageOrPdf, (a) =>
  `- \`${a.file}\` — page=${a.frontmatter.page ?? '∅'} pdfFile=${a.frontmatter.pdfFile ?? '∅'}`
);

if (lowCountIssues.length || highCountIssues.length) {
  lines.push('## Issue article counts\n');
  lines.push('| Issue | Articles |');
  lines.push('| --- | ---: |');
  for (const { issue, count } of issueCounts) {
    const marker = count <= LOW_ARTICLES_PER_ISSUE ? ' ⚠️ low' : count >= HIGH_ARTICLES_PER_ISSUE ? ' ⚠️ high' : '';
    lines.push(`| ${issue} | ${count}${marker} |`);
  }
  lines.push('');
}

fs.writeFileSync(REPORT_PATH, lines.join('\n'));

const total = Object.values(flags).reduce(
  (n, v) => n + (Array.isArray(v) ? v.length : 0),
  0
);
console.log(`QA report written to ${path.relative(REPO_ROOT, REPORT_PATH)}`);
console.log(`${total} flags across ${articles.length} articles.`);
