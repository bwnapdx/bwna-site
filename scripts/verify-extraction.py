#!/usr/bin/env python3
"""Check extracted articles word for word against a newsletter PDF's text layer.

Usage:
    python3 scripts/verify-extraction.py 2001-12 [2002-02 ...] [--threshold 0.99] [--quiet]

Works for any issue whose PDF has a real text layer (the 2001-2011 issues do;
check with `pdftotext public/newsletters/bwna-YYYY-MM.pdf - | wc -w`).

Two checks:

1. Fidelity: every paragraph of every src/content/newsletters/YYYY-MM-*.md
   must appear in the PDF text. Text is compared as lowercase letters and
   digits only, so case, punctuation, quotes, dashes, line-break hyphens, drop
   caps and column order don't matter. A paragraph scoring below the threshold
   has words that aren't in the PDF, which means it was paraphrased or
   mis-read, and the unmatched words are printed. This catches changed and
   added words. It can't catch a dropped word or phrase, because a gap looks
   the same as text continuing in another column. Long dropped passages show
   up in the coverage check.

2. Coverage: for each PDF page, how much of its text made it into some
   article. Long runs of text that no article contains are printed so you can
   tell dropped articles apart from ads and boilerplate (rosters, the staff
   box, the mailing panel), which are skipped on purpose.

Exits 1 if any paragraph fails the fidelity check.
"""

import argparse
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = ROOT / "public/newsletters"
ARTICLES_DIR = ROOT / "src/content/newsletters"
N = 12  # shingle length, in normalized characters
MIN_UNCOVERED = 150  # report uncovered runs at least this long (normalized chars)


def normalize(text):
    """Return (normalized string, index map back into text)."""
    out, idx = [], []
    for i, ch in enumerate(text):
        for c in unicodedata.normalize("NFKD", ch).lower():
            if c.isascii() and c.isalnum():
                out.append(c)
                idx.append(i)
    return "".join(out), idx


def shingles(s):
    return {s[i:i + N] for i in range(len(s) - N + 1)}


def strip_markdown(p):
    p = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", p)
    p = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", p)
    p = re.sub(r"<[^>]+>", "", p)
    p = re.sub(r"^\s*(#+|>|[-*+]|\d+\.)\s+", "", p, flags=re.M)
    return p


def body_of(md):
    parts = md.split("---", 2)
    return parts[2] if md.startswith("---") and len(parts) == 3 else md


def runs(flags):
    """Yield (start, end) of runs where flags[i] is True."""
    start = None
    for i, f in enumerate(flags + [False]):
        if f and start is None:
            start = i
        elif not f and start is not None:
            yield start, i
            start = None


def excerpt(text, idx, a, b, width=220):
    s = text[idx[a]: idx[min(b, len(idx) - 1)] + 1]
    s = " ".join(s.split())
    return s if len(s) <= width else s[: width - 3] + "..."


def check_issue(slug, threshold, quiet):
    pdf = PDF_DIR / f"bwna-{slug}.pdf"
    raw = subprocess.run(["pdftotext", "-q", str(pdf), "-"], capture_output=True, text=True, check=True).stdout
    pages = raw.split("\f")
    if pages and not pages[-1].strip():
        pages.pop()
    page_norm = [normalize(p) for p in pages]
    source = set().union(*(shingles(n) for n, _ in page_norm))
    source_text = "|".join(n for n, _ in page_norm)
    if not source:
        print(f"{slug}: no text layer, can't verify")
        return False

    files = sorted(ARTICLES_DIR.glob(f"{slug}-*.md"))
    print(f"\n=== {slug}: {len(files)} articles, {len(pages)} pages ===")
    if not files:
        return False

    failures = 0
    paragraphs = 0
    article_grams = set()
    for f in files:
        body = body_of(f.read_text())
        for para in re.split(r"\n\s*\n", body):
            text = strip_markdown(para)
            norm, idx = normalize(text)
            if len(norm) < N * 2:
                continue
            paragraphs += 1
            grams = [norm[i:i + N] for i in range(len(norm) - N + 1)]
            article_grams.update(grams)
            hit = [g in source for g in grams]
            # Score by characters, not shingles: a character counts as found if
            # any 12-character stretch containing it is in the PDF. Scoring
            # shingles would fail every paragraph that continues in another
            # column, because the PDF text puts other text at the join.
            covered = [False] * len(norm)
            for i, h in enumerate(hit):
                if h:
                    for j in range(i, i + N):
                        covered[j] = True
            # A short word stranded between two ads or column fragments (e.g.
            # "endeavor." on its own line between ad copy) is too short for a
            # 12-character match. Accept a gap if its exact text is in the PDF.
            for a, b in list(runs([not c for c in covered])):
                if b - a >= 4 and norm[a:b] in source_text:
                    covered[a:b] = [True] * (b - a)
            score = sum(covered) / len(covered)
            if score < threshold:
                failures += 1
                print(f"\n  FAIL {score:.3f}  {f.name}")
                print(f"    {excerpt(text, idx, 0, len(norm) - 1, 160)}")
                for a, b in runs([not c for c in covered]):
                    print(f"    not in PDF: \"{excerpt(text, idx, a, b - 1, 120)}\"")

    print(f"\n  fidelity: {paragraphs - failures}/{paragraphs} paragraphs at or above {threshold}")

    print("\n  coverage by page (share of the page's text found in an article):")
    for n, (norm, idx) in enumerate(page_norm, 1):
        if len(norm) < N:
            print(f"    p{n}: (no text)")
            continue
        hit = [norm[i:i + N] in article_grams for i in range(len(norm) - N + 1)]
        covered = [False] * len(norm)
        for i, h in enumerate(hit):
            if h:
                for j in range(i, i + N):
                    covered[j] = True
        pct = sum(covered) / len(covered)
        print(f"    p{n}: {pct:5.1%}")
        if quiet:
            continue
        for a, b in runs([not c for c in covered]):
            if b - a >= MIN_UNCOVERED:
                print(f"         missing ({b - a} chars): \"{excerpt(pages[n - 1], idx, a, b - 1)}\"")

    return failures == 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("issues", nargs="+")
    ap.add_argument("--threshold", type=float, default=0.99)
    ap.add_argument("--quiet", action="store_true", help="skip listing uncovered text")
    args = ap.parse_args()
    ok = all([check_issue(s, args.threshold, args.quiet) for s in args.issues])
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
