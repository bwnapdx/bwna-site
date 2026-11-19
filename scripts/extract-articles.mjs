#!/usr/bin/env node
// Extract articles from BWNA newsletter PDFs using the Claude API.
//
// Usage:
//   node scripts/extract-articles.mjs --issues=2024-11                    # sync, one issue (pilot)
//   node scripts/extract-articles.mjs --issues=2024-11,2024-09 --batch    # batch mode
//   node scripts/extract-articles.mjs --all --batch                       # every un-extracted issue
//   node scripts/extract-articles.mjs --poll=msgbatch_XXX                 # resume a running batch
//   node scripts/extract-articles.mjs --dry-run --issues=2024-11          # show plan, no API calls
//
// Output: markdown files in src/content/newsletters/

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const NEWSLETTERS_PDF_DIR = path.join(REPO_ROOT, 'public/newsletters');
const ARTICLES_OUT_DIR = path.join(REPO_ROOT, 'src/content/newsletters');
const IMAGE_CACHE_DIR = '/tmp/bwna-batch';
const MODEL = 'claude-sonnet-5-5';
const DPI = 150;

const CATEGORIES = [
  'presidents-message', 'community-news', 'land-use', 'parks', 'safety',
  'schools', 'business', 'events', 'history', 'environment', 'opinion',
  'announcements', 'volunteer', 'other',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Issues that don't follow the two-month pattern. Keep in sync with
// src/data/issues.ts.
const ISSUE_LABEL_OVERRIDES = {
  '2009-10': 'Oct-Dec 2009', // three-month issue bridging to the Jan-Feb schedule
};

// Credentials, in order: ANTHROPIC_AUTH_TOKEN, the `ant` CLI's signed-in
// profile (run `ant auth login` once; it refreshes its own token), then
// ANTHROPIC_API_KEY from .env.
function makeClient() {
  if (process.env.ANTHROPIC_AUTH_TOKEN) {
    return new Anthropic({ authToken: process.env.ANTHROPIC_AUTH_TOKEN, apiKey: null });
  }
  try {
    const authToken = execSync('ant auth print-credentials --access-token', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
    if (authToken) {
      console.log('Using the ant CLI sign-in');
      return new Anthropic({ authToken, apiKey: null });
    }
  } catch {
    // ant not installed or not signed in
  }
  if (process.env.ANTHROPIC_API_KEY) return new Anthropic();
  console.error('No credentials: run `ant auth login`, or set ANTHROPIC_API_KEY in .env');
  process.exit(1);
}

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [k, v] = arg.slice(2).split('=');
      args[k] = v === undefined ? true : v;
    }
  }
  return args;
}

function listAvailableIssues() {
  return fs.readdirSync(NEWSLETTERS_PDF_DIR)
    .filter(f => /^bwna-\d{4}-\d{2}\.pdf$/.test(f))
    .map(f => f.match(/bwna-(\d{4}-\d{2})\.pdf/)[1])
    .sort();
}

function listExtractedIssues() {
  if (!fs.existsSync(ARTICLES_OUT_DIR)) return new Set();
  const slugs = new Set();
  for (const f of fs.readdirSync(ARTICLES_OUT_DIR)) {
    const m = f.match(/^(\d{4}-\d{2})-/);
    if (m) slugs.add(m[1]);
  }
  return slugs;
}

// Every issue covers two months, named by its first month: 2012-01 is
// "Jan-Feb 2012". Before 2010 the issues started on even months, so 2001-12
// is "Dec 2001-Jan 2002".
function issueDisplayName(issueSlug) {
  if (ISSUE_LABEL_OVERRIDES[issueSlug]) return ISSUE_LABEL_OVERRIDES[issueSlug];
  const [year, month] = issueSlug.split('-').map(Number);
  const first = MONTHS[month - 1];
  if (month === 12) return `Dec ${year}-Jan ${year + 1}`;
  return `${first}-${MONTHS[month]} ${year}`;
}

// The PDF's own text layer, one string per page. Pre-2012 issues were made
// digitally and have a clean one; we pass it alongside the page images so the
// model can transcribe from real text instead of reading pixels. Returns []
// when there's no usable text layer (scanned issues).
function pdfPageTexts(issueSlug) {
  const pdfPath = path.join(NEWSLETTERS_PDF_DIR, `bwna-${issueSlug}.pdf`);
  const text = execSync(`pdftotext -q "${pdfPath}" -`, { maxBuffer: 64 * 1024 * 1024 }).toString();
  const pages = text.split('\f');
  if (pages.at(-1).trim() === '') pages.pop();
  const words = pages.join(' ').split(/\s+/).filter(Boolean).length;
  return words > 200 * pages.length ? pages : [];
}

function issueDate(issueSlug) {
  return `${issueSlug}-01`;
}

function pdfToImages(issueSlug) {
  const pdfPath = path.join(NEWSLETTERS_PDF_DIR, `bwna-${issueSlug}.pdf`);
  if (!fs.existsSync(pdfPath)) throw new Error(`Missing PDF: ${pdfPath}`);

  const outDir = path.join(IMAGE_CACHE_DIR, issueSlug);
  if (!fs.existsSync(outDir) || fs.readdirSync(outDir).length === 0) {
    fs.mkdirSync(outDir, { recursive: true });
    execSync(`pdftoppm -jpeg -r ${DPI} "${pdfPath}" "${outDir}/page"`, { stdio: 'inherit' });
  }
  return fs.readdirSync(outDir)
    .filter(f => f.endsWith('.jpg'))
    .sort()
    .map(f => path.join(outDir, f));
}

function buildSystemPrompt() {
  return `You are helping the Beaumont-Wilshire Neighborhood Association (BWNA) archive their own community newsletter into a searchable website. BWNA is the publisher and copyright holder of these public bimonthly newsletters and has full rights to reproduce and archive this content on their official website (bwnapdx.org). The user is a volunteer helping migrate the archive.

You will receive one issue of the newsletter. Your job is to identify each article and submit it using the \`save_article\` tool — one tool call per article, as many parallel calls as needed in a single response.

This is an archive, so transcribe every article word for word, exactly as printed. Never summarize, condense, paraphrase, reorder sentences or "fix" wording. Keep the printed spelling, typos, capitalization of names and numbers as they are. The only changes allowed are: rejoin words hyphenated across line breaks, rejoin drop caps to their word (e.g. "R ECENT EVENTS" → "Recent events"), rejoin sentences split across columns or pages, and convert ALL-CAPS lead-ins to normal sentence case.

When a page's text layer is supplied, copy the words from it. Use the page image only to work out reading order, which text belongs to which article, headings, pull quotes and formatting. The text layer's line order can jump between columns, so follow the image for order.

A few conventions for the archive:
- Skip recurring boilerplate that isn't an article: the officers and board member roster, the newsletter staff box, submission guidelines, the mailing panel and return address.
- Please skip full-page advertisements; we only want editorial articles.
- The "IN THIS ISSUE" table of contents is not an article.
- The cover story (usually a prominent front-page feature) should have featured: true. All others false.
- Multi-item columns like News Bits, Upcoming Events, and Ways to Give should be one article with ## subheadings for each item.
- The "Get Involved!" page is one article in the "volunteer" category with ## subheadings for each call-out.
- If an article ends with an italicized author bio, include it as the final italicized paragraph of the body.
- Pulled quotes become markdown blockquotes (>).
- Recipes keep their ingredient lists (bulleted) and instructions (numbered).
- Sidebars that clearly extend an article can be merged as a ## section, or split if independent.
- Titles: use what's printed, but convert ALL-CAPS headlines to Title Case (e.g. "BLOCK PARTY ROCKED!" → "Block Party Rocked!"). Keep acronyms uppercase (BWNA, BMS, PTA, NE, SE, SW, NW).
- For recurring columns (President's Message, Stirring the Pot, Neighbor Spotlight, etc.), use this issue's specific subtitle as the title — not the column name. If there's no subtitle, use the column name in Title Case.
- author: only if there's an explicit byline ("By <name>"). Omit otherwise. Don't put the bio text here; that belongs in the body.
- slug: short kebab-case slug derived from the title (~40 chars max).
- body: the article body in clean markdown, preserving paragraph breaks and any bold/italic/list formatting. Do not add an H1 for the title — that's stored in frontmatter. Start the body with the first paragraph or subheading.

Call \`save_article\` once per article. No other text needed.`;
}

const SAVE_ARTICLE_TOOL = {
  name: 'save_article',
  description: 'Save one article extracted from the newsletter. Call this once per article.',
  input_schema: {
    type: 'object',
    properties: {
      slug: { type: 'string', description: 'kebab-case slug for filename' },
      title: { type: 'string', description: 'article title as printed' },
      author: { type: 'string', description: 'byline author (omit if no byline)' },
      page: { type: 'integer', description: 'PDF page number (1-indexed)' },
      category: { type: 'string', enum: CATEGORIES },
      featured: { type: 'boolean' },
      body: { type: 'string', description: 'full article body in markdown' },
    },
    required: ['slug', 'title', 'page', 'category', 'featured', 'body'],
  },
};

function buildUserMessageFromImages(issueSlug, imagePaths) {
  const texts = pdfPageTexts(issueSlug);
  const pageBlocks = imagePaths.flatMap((p, i) => [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: fs.readFileSync(p).toString('base64'),
      },
    },
    ...(texts[i] ? [{ type: 'text', text: `Text layer of page ${i + 1}:\n\n${texts[i]}` }] : []),
  ]);
  return {
    role: 'user',
    content: [
      ...pageBlocks,
      {
        type: 'text',
        text: `Issue: ${issueDisplayName(issueSlug)} (pdfFile: bwna-${issueSlug}.pdf)\n\nPlease extract all articles from this issue of the BWNA newsletter archive.`,
      },
    ],
  };
}

function buildUserMessageFromPdf(issueSlug) {
  const pdfPath = path.join(NEWSLETTERS_PDF_DIR, `bwna-${issueSlug}.pdf`);
  const data = fs.readFileSync(pdfPath).toString('base64');
  return {
    role: 'user',
    content: [
      {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data,
        },
      },
      {
        type: 'text',
        text: `Issue: ${issueDisplayName(issueSlug)} (pdfFile: bwna-${issueSlug}.pdf)\n\nPlease extract all articles from this issue of the BWNA newsletter archive.`,
      },
    ],
  };
}

function buildRequestParams(issueSlug, { usePdf = false } = {}) {
  const userMessage = usePdf
    ? buildUserMessageFromPdf(issueSlug)
    : buildUserMessageFromImages(issueSlug, pdfToImages(issueSlug));
  return {
    model: MODEL,
    max_tokens: 32000, // 12-page issues need ~20k
    system: buildSystemPrompt(),
    tools: [SAVE_ARTICLE_TOOL],
    tool_choice: { type: 'auto' }, // Sonnet 5.5 rejects forced tool choice ('any'/'tool')
    messages: [userMessage],
    metadata: { user_id: `bwna-${issueSlug}` },
  };
}

function extractArticlesFromResponse(content) {
  const articles = [];
  for (const block of content) {
    if (block.type === 'tool_use' && block.name === 'save_article') {
      let input = block.input;
      if (typeof input === 'string') input = JSON.parse(input);
      articles.push(input);
    }
  }
  if (articles.length === 0) {
    throw new Error('No save_article tool_use blocks in response');
  }
  return articles;
}

const BARE_YAML_KEYS = new Set(['date']);

function frontmatterYAML(obj) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (BARE_YAML_KEYS.has(k)) lines.push(`${k}: ${v}`);
    else if (typeof v === 'string') lines.push(`${k}: "${v.replace(/"/g, '\\"')}"`);
    else lines.push(`${k}: ${v}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

function cleanBody(body) {
  // Strip a leading H1 heading — title lives in frontmatter.
  return body.replace(/^#\s+[^\n]+\n+/, '').trim();
}

function writeArticles(issueSlug, articles) {
  let written = 0;
  for (const a of articles) {
    // tool_choice is 'auto' (Sonnet 5.5 can't force tools), so the input schema
    // isn't guaranteed. Skip incomplete calls instead of crashing mid-issue.
    const missing = ['slug', 'title', 'body', 'category'].filter(k => typeof a[k] !== 'string' || !a[k]);
    if (missing.length) {
      console.log(`  SKIPPED incomplete article (${a.slug ?? 'no slug'}): missing ${missing.join(', ')}`);
      continue;
    }
    const filename = `${issueSlug}-${a.slug}.md`;
    const filepath = path.join(ARTICLES_OUT_DIR, filename);
    if (fs.existsSync(filepath)) {
      console.log(`  skip (exists): ${filename}`);
      continue;
    }
    const fm = {
      title: a.title,
      issue: issueDisplayName(issueSlug),
      issueSlug: issueSlug,
      ...(a.author ? { author: a.author } : {}),
      date: issueDate(issueSlug),
      category: a.category,
      featured: a.featured ?? false,
      ...(a.page ? { page: a.page } : {}),
      pdfFile: `bwna-${issueSlug}.pdf`,
    };
    fs.writeFileSync(filepath, frontmatterYAML(fm) + cleanBody(a.body) + '\n');
    written++;
  }
  return written;
}

async function runSync(anthropic, issues, opts = {}) {
  for (const issueSlug of issues) {
    console.log(`\n=== ${issueSlug} ===`);
    try {
      const params = buildRequestParams(issueSlug, opts);
      console.log(`  model=${params.model}, mode=${opts.usePdf ? 'pdf' : 'images'}`);
      // Streamed: the SDK refuses non-streaming requests this large.
      const resp = await anthropic.messages.stream(params).finalMessage();
      console.log(`  tokens: in=${resp.usage.input_tokens} out=${resp.usage.output_tokens} stop=${resp.stop_reason}`);
      const articles = extractArticlesFromResponse(resp.content);
      console.log(`  extracted ${articles.length} articles`);
      const written = writeArticles(issueSlug, articles);
      console.log(`  wrote ${written} new files`);
    } catch (err) {
      const msg = err?.error?.error?.message ?? err?.message ?? String(err);
      console.log(`  FAILED: ${msg}`);
    }
  }
}

const BATCH_CHUNK_SIZE = 25;  // ~120MB per batch (256MB API limit)

async function runBatch(anthropic, issues, opts = {}) {
  const chunks = [];
  for (let i = 0; i < issues.length; i += BATCH_CHUNK_SIZE) {
    chunks.push(issues.slice(i, i + BATCH_CHUNK_SIZE));
  }
  console.log(`Splitting ${issues.length} issues into ${chunks.length} batch(es) of up to ${BATCH_CHUNK_SIZE}`);

  const batchIds = [];
  for (const [i, chunk] of chunks.entries()) {
    const requests = chunk.map(issueSlug => ({
      custom_id: issueSlug,
      params: buildRequestParams(issueSlug, opts),
    }));
    console.log(`\nSubmitting batch ${i + 1}/${chunks.length} (${requests.length} requests)...`);
    let batch;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        batch = await anthropic.messages.batches.create({ requests });
        break;
      } catch (err) {
        const isRetryable = err.code === 'EPIPE' || err.status === 502 || err.status === 503 || err.status === 504 || err.name === 'APIConnectionError';
        if (attempt === 4 || !isRetryable) throw err;
        const delay = 2000 * attempt;
        console.log(`  attempt ${attempt} failed (${err.message}); retrying in ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    console.log(`  batch id: ${batch.id}`);
    batchIds.push(batch.id);
  }

  console.log(`\nAll batches submitted. IDs:`);
  batchIds.forEach(id => console.log(`  ${id}`));
  console.log(`Resume any with: node scripts/extract-articles.mjs --poll=<batch_id>`);

  for (const batchId of batchIds) {
    console.log(`\n=== Polling ${batchId} ===`);
    await pollBatch(anthropic, batchId);
  }
}

async function pollBatch(anthropic, batchId) {
  while (true) {
    const batch = await anthropic.messages.batches.retrieve(batchId);
    const c = batch.request_counts;
    console.log(`[${new Date().toISOString()}] ${batch.processing_status}  processing=${c.processing} succeeded=${c.succeeded} errored=${c.errored} canceled=${c.canceled} expired=${c.expired}`);
    if (batch.processing_status === 'ended') break;
    await new Promise(r => setTimeout(r, 30000));
  }
  console.log(`\nFetching results for ${batchId}...`);
  const results = await anthropic.messages.batches.results(batchId);
  for await (const entry of results) {
    const issueSlug = entry.custom_id;
    console.log(`\n--- ${issueSlug} ---`);
    if (entry.result.type !== 'succeeded') {
      console.log(`  FAILED: ${JSON.stringify(entry.result).slice(0, 200)}`);
      continue;
    }
    try {
      const articles = extractArticlesFromResponse(entry.result.message.content);
      const written = writeArticles(issueSlug, articles);
      console.log(`  extracted=${articles.length} written=${written}`);
    } catch (e) {
      console.log(`  PARSE FAIL: ${e.message}`);
      fs.writeFileSync(`/tmp/bwna-${issueSlug}-raw.json`, JSON.stringify(entry.result.message.content, null, 2));
      console.log(`  raw saved to /tmp/bwna-${issueSlug}-raw.json`);
    }
  }
}

async function main() {
  const args = parseArgs();

  if (args.poll) {
    const anthropic = makeClient();
    await pollBatch(anthropic, args.poll);
    return;
  }

  let issues;
  if (args.issues) {
    issues = args.issues.split(',').map(s => s.trim());
  } else if (args.all) {
    const all = listAvailableIssues();
    const done = listExtractedIssues();
    issues = all.filter(i => !done.has(i));
  } else {
    console.error('Usage: --issues=YYYY-MM[,YYYY-MM...] or --all or --poll=batch_id');
    process.exit(1);
  }

  console.log(`Issues to process: ${issues.length}`);
  console.log(issues.join(', '));

  if (args['dry-run']) {
    for (const issueSlug of issues) {
      const images = pdfToImages(issueSlug);
      console.log(`  ${issueSlug}: ${images.length} pages`);
    }
    return;
  }

  const anthropic = makeClient();
  const opts = { usePdf: !!args.pdf };

  if (args.batch) {
    await runBatch(anthropic, issues, opts);
  } else {
    await runSync(anthropic, issues, opts);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
