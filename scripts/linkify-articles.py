#!/usr/bin/env python3
# Wrap bare web addresses and email addresses in newsletter article bodies in
# markdown links. Link text stays exactly as printed; BWNApdx.org addresses map
# to the current site's routes. Existing markdown links are left alone, so it's
# safe to rerun.
#
# Usage: python3 scripts/linkify-articles.py src/content/newsletters/2026-09-*.md

import re, sys, pathlib

INTERNAL = {'': '/', 'subscribe': '/subscribe', 'upcoming-events': '/events', 'about-us': '/about'}
TLDS = r'(?:org|com|net|gov|edu|us|io)'
EMAIL = r'[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.' + TLDS
URL = r'(?:https?://)?(?:www\.)?[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.' + TLDS + r'(?:/[^\s)<>"\]]*)?'
TOKEN = re.compile(r'(?<![\w@./\[-])(' + EMAIL + r'|' + URL + r')')
MDLINK = re.compile(r'\[[^\]]*\]\([^)]*\)|<[^>]+>')

def href_for(t):
    if '@' in t:
        return 'mailto:' + t
    bare = re.sub(r'^https?://', '', t)
    host, _, path = bare.partition('/')
    h = host.lower()
    if h in ('bwnapdx.org', 'www.bwnapdx.org', 'bwna.pdx.org'):
        return INTERNAL.get(path.lower().strip('/'), None) or ('/' + path)
    return t if t.startswith('http') else 'https://' + bare

def linkify(text, log):
    out, pos = [], 0
    protected = [m.span() for m in MDLINK.finditer(text)]
    def inside(i): return any(a <= i < b for a, b in protected)
    for m in TOKEN.finditer(text):
        tok = m.group(1)
        stripped = tok.rstrip('.,;:!?')
        if inside(m.start()):
            continue
        out.append(text[pos:m.start()])
        h = href_for(stripped)
        out.append(f'[{stripped}]({h})')
        log.append((stripped, h))
        pos = m.start() + len(stripped)
    out.append(text[pos:])
    return ''.join(out)

for f in sys.argv[1:]:
    p = pathlib.Path(f)
    src = p.read_text()
    m = re.match(r'(---\n.*?\n---\n)(.*)', src, re.S)
    log = []
    body = linkify(m.group(2), log)
    if log:
        p.write_text(m.group(1) + body)
        for t, h in log: print(f'{p.name}: {t} -> {h}')
