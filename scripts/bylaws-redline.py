#!/usr/bin/env python3
"""Build a word-level redline of proposed bylaws changes for /bylaws/proposed-changes.

Compares the adopted bylaws (the published PDF) against a proposed-revision .docx and
writes src/data/bylaws-proposed.json: one entry per article, each a list of paragraphs,
each a list of {op, text} runs where op is "eq", "ins" or "del".

Paragraph breaks follow the proposed .docx. Deleted text is placed where it stood.
Requires pdftotext (brew install poppler).

Usage:
  python3 scripts/bylaws-redline.py "path/to/BWNA Bylaws with Changes.docx" [--source "label"]
"""
import argparse
import difflib
import json
import re
import subprocess
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CURRENT_PDF = ROOT / 'public/documents/bwna-bylaws.pdf'
OUT = ROOT / 'src/data/bylaws-proposed.json'
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
BREAK = '\n'


def normalize(s: str) -> str:
    """Whitespace cleanup only. The text shown on the page keeps each source's own
    characters (curly quotes in the .docx, "--" in the PDF)."""
    return s.replace('\u200b', '').replace('\u00a0', ' ').replace('\t', ' ')


def match_key(word: str) -> str:
    """Comparison form of a word, so typographic differences between the sources
    (curly vs straight quotes, "--" vs an em dash) aren't reported as edits."""
    word = word.replace('\u2019', "'").replace('\u2018', "'").replace('\u201c', '"').replace('\u201d', '"')
    return word.replace('--', '\u2014')


def docx_paragraphs(path: Path) -> list[str]:
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read('word/document.xml'))
    paras = []
    for p in root.iter(W + 'p'):
        text = ''
        for el in p.iter():
            if el.tag == W + 't':
                text += el.text or ''
            elif el.tag in (W + 'tab',):
                text += ' '
            elif el.tag in (W + 'br', W + 'cr'):
                text += BREAK
        for line in normalize(text).split(BREAK):
            if line.strip():
                paras.append(line.strip())
    return paras


def pdf_text(path: Path) -> str:
    text = subprocess.run(['pdftotext', str(path), '-'], capture_output=True, text=True, check=True).stdout
    keep = []
    for line in text.splitlines():
        if re.fullmatch(r'\s*(Page \d+/\d+|Beaumont-Wilshire Neighborhood Association|BWNA Bylaws|Adopted December 9, 2024)\s*', line):
            continue
        keep.append(line)
    return normalize(' '.join(keep))


def split_glued(paras: list[str]) -> list[str]:
    """Start a new paragraph at list items and headings that run on in the .docx
    ("per entity.B. There are", "Section 1: MethodThe question")."""
    out = []
    for para in paras:
        para = re.sub(r'(?<=[.;:)])\s*(?=[A-G]\.\s+[A-Z])', BREAK, para)
        para = re.sub(r'(?<=[a-z.])\s*(?=Section \d+:)', BREAK, para)
        out.extend(x.strip() for x in para.split(BREAK) if x.strip())
    return out


def title_case(s: str) -> str:
    small = {'and', 'of', 'for', 'the', 'a', 'an', 'to', 'in', 'on'}
    words = s.lower().split()
    return ' '.join(w if i and w in small else w.capitalize() for i, w in enumerate(words))


ARTICLE_RE = re.compile(r'^ARTICLE\s*:?\s*(\d+)\s*:?\s*(.*)$')


def articles_from_paras(paras):
    arts, cur = [], None
    for p in paras:
        m = ARTICLE_RE.match(p)
        if m:
            cur = {'number': int(m.group(1)), 'title': m.group(2).strip(), 'paras': []}
            arts.append(cur)
        elif cur:
            cur['paras'].append(p)
    return arts


def articles_from_text(text):
    parts = re.split(r'ARTICLE\s*:?\s*(\d+)\s*:?\s*', text)
    arts = {}
    for i in range(1, len(parts), 2):
        num = int(parts[i])
        body = parts[i + 1]
        # title is the uppercase run at the start
        m = re.match(r"([A-Z][A-Z ,&']+?)\s+(?=[A-Z][a-z]|Section)", body)
        title = m.group(1).strip() if m else ''
        arts[num] = {'title': title, 'words': body[m.end():].split() if m else body.split()}
    return arts


def coalesce(ops, prop_words, starts, max_gap=2):
    """Fold short unchanged runs (a word or two, like "the" or "of BWNA") that sit
    between edits into the surrounding edit, so a rewritten sentence reads as one
    struck phrase and one new phrase instead of confetti. Never folds across a
    paragraph break."""
    ops = [list(o) for o in ops]
    for i in range(1, len(ops) - 1):
        tag, a0, a1, b0, b1 = ops[i]
        if (tag == 'equal' and b1 - b0 <= max_gap
                and ops[i - 1][0] != 'equal' and ops[i + 1][0] != 'equal'
                and not any(j in starts for j in range(b0, b1 + 1))):
            ops[i][0] = 'replace'
    merged = []
    for op in ops:
        if merged and op[0] != 'equal' and merged[-1][0] != 'equal':
            prev = merged[-1]
            merged[-1] = ['replace', prev[1], op[2], prev[3], op[4]]
        else:
            merged.append(op)
    return merged


def diff_article(cur_words, prop_paras):
    prop_words, starts = [], set()
    for p in prop_paras:
        starts.add(len(prop_words))
        prop_words.extend(p.split())
    sm = difflib.SequenceMatcher(a=[match_key(w) for w in cur_words], b=[match_key(w) for w in prop_words], autojunk=False)
    paras, run = [], []

    def emit(op, words):
        if not words:
            return
        text = ' '.join(words)
        if run and run[-1]['op'] == op and 'current' not in run[-1]:
            run[-1]['text'] += ' ' + text
        else:
            run.append({'op': op, 'text': text})

    def new_para():
        nonlocal run
        if run:
            paras.append(run)
        run = []

    for tag, a0, a1, b0, b1 in coalesce(sm.get_opcodes(), prop_words, starts):
        if tag in ('delete', 'replace'):
            emit('del', cur_words[a0:a1])
        if tag in ('equal', 'insert', 'replace'):
            op = 'eq' if tag == 'equal' else 'ins'
            chunk = []
            for j in range(b0, b1):
                if j in starts and j != 0:
                    emit(op, chunk)
                    chunk = []
                    new_para()
                cur_word = cur_words[a0 + j - b0] if tag == 'equal' else None
                if cur_word is not None and cur_word != prop_words[j]:
                    # Same word, different typography (city's / city’s): keep both
                    # spellings so each view shows its own source exactly.
                    emit(op, chunk)
                    chunk = []
                    run.append({'op': 'eq', 'text': prop_words[j], 'current': cur_word})
                    continue
                chunk.append(prop_words[j])
            emit(op, chunk)
    new_para()
    return paras


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('docx', type=Path)
    ap.add_argument('--source', default=None, help='label for the proposal, stored in the JSON')
    args = ap.parse_args()

    paras = split_glued(docx_paragraphs(args.docx))
    proposed = articles_from_paras(paras)
    current = articles_from_text(pdf_text(CURRENT_PDF))

    out = []
    for art in proposed:
        cur = current.get(art['number'], {'title': '', 'words': []})
        body = diff_article(cur['words'], art['paras'])
        changed = any(r['op'] != 'eq' for p in body for r in p)
        out.append({
            'number': art['number'],
            'title': title_case(art['title']),
            'currentTitle': title_case(cur['title']),
            'changed': changed or cur['title'].upper() != art['title'].upper(),
            'paragraphs': body,
        })
    missing = sorted(set(current) - {a['number'] for a in proposed})
    if missing:
        sys.exit(f'Articles missing from the proposal: {missing}')

    OUT.write_text(json.dumps({'source': args.source or args.docx.name, 'articles': out}, indent=1, ensure_ascii=False) + '\n')
    ins = sum(len(r['text'].split()) for a in out for p in a['paragraphs'] for r in p if r['op'] == 'ins')
    dels = sum(len(r['text'].split()) for a in out for p in a['paragraphs'] for r in p if r['op'] == 'del')
    print(f'Wrote {OUT.relative_to(ROOT)}: {len(out)} articles, {sum(a["changed"] for a in out)} changed, +{ins} / -{dels} words')


if __name__ == '__main__':
    main()
