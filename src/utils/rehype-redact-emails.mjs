// Keeps personal email addresses off the site.
//
// Runs on every rendered markdown file (newsletter articles, Community
// Updates, event descriptions) at build time, so the source files stay as
// printed or sent and scripts/verify-extraction.py still checks them against
// the PDFs. Site search (Pagefind) indexes the built HTML, so it never sees
// the removed addresses either.
//
// - @bwnapdx.org addresses are left alone.
// - Addresses of BWNA people (board members, committee chairs, organizers)
//   become a bwnapdx.org address, usually info@. A link like
//   [John Sandie](mailto:...) keeps its text and now goes to info@.
// - Outside organizations' public addresses (city offices, schools,
//   businesses, nonprofits) are kept.
// - Personal addresses show as "[email removed]": anything at a personal
//   mail provider (PERSONAL_DOMAINS), the old bwna.org/bwna.us domains, and
//   the individuals in REMOVE. A mailto link around a name becomes the plain
//   name.
//
// The PDFs in public/newsletters are the original issues and still contain
// the addresses as printed.
//
// When a new board member, chair or organizer starts appearing in Community
// Updates with a personal address, add it to BWNA_PEOPLE so readers get
// info@ instead of "[email removed]". If someone's own address is at an
// organization or a personal domain (so it would be kept), add it to REMOVE
// or BWNA_PEOPLE. Hand-written .astro pages should use a bwnapdx.org address
// directly.

export const FORWARD_TO = 'info@bwnapdx.org';
export const REMOVED = '[email removed]';

// address -> bwnapdx.org address to show instead
export const BWNA_PEOPLE = new Map([
  // Board members
  ['patricekoehler@gmail.com', FORWARD_TO],
  ['abreaks@hotmail.com', FORWARD_TO],
  ['angfrome@yahoo.com', FORWARD_TO],
  ['colin@colinoneill.net', FORWARD_TO],
  ['swollentongue@gmail.com', FORWARD_TO],
  ['root.timothy@gmail.com', FORWARD_TO],
  ['davidknowlespdx@gmail.com', FORWARD_TO],
  ['crystaldgrainger@gmail.com', FORWARD_TO],
  ['tcuppernull@gmail.com', FORWARD_TO],
  ['susan@trabucco.biz', 'editor@bwnapdx.org'],   // Susan Trabucco, editor
  // Committee chairs and organizers
  ['sandiefam@gmail.com', FORWARD_TO],             // John Sandie, Events
  ['pdx.stmptwn@gmail.com', FORWARD_TO],           // Rudd, Transportation
  ['hello@stevenavery.com', FORWARD_TO],           // Steve Avery, Communications
  ['friendsofwilshirepark@gmail.com', FORWARD_TO], // Friends of Wilshire Park
  ['georginafh@outlook.com', FORWARD_TO],          // Georgina Head, newsletter delivery
  ['maryroney643@gmail.com', FORWARD_TO],          // Art & Garden Tour
  ['kellydery@icloud.com', FORWARD_TO],            // Art & Garden Tour
]);

// Personal mail providers, including the dial-up and cable ISPs common in
// the 2002-2011 issues, plus BWNA's old domains (no longer in service).
export const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
  'aol.com', 'icloud.com', 'mac.com', 'me.com', 'email.com', 'netzero.com',
  'juno.com', 'earthlink.net', 'mindspring.com', 'comcast.net', 'attbi.com',
  'att.net', 'sbcglobal.net', 'verizon.net', 'qwest.net', 'q.com',
  'centurylink.net', 'frontier.com', 'pacifier.com', 'aracnet.com',
  'teleport.com', 'easystreet.com', 'hevanet.com', 'spiritone.com',
  'europa.com', 'quik.com', 'myuw.net',
  'bwna.org', 'bwna.us',
]);

// Individuals whose own address happens to be at an organization's domain.
export const REMOVE = new Set([
  'hblischk@ch2m.com', // 2001 BWNA board member's work address
]);

// Allows a stray space on either side of the @, which some archive text has
// ("bsallinger@ audubonportland.org").
const EMAIL = /[A-Za-z0-9._%+-]+ ?@ ?[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
const SKIP = new Set(['code', 'pre', 'script', 'style']);

/** The address to show instead, or null to remove it. */
export function rewriteEmail(address) {
  const a = address.toLowerCase().replace(/ /g, '');
  if (a.endsWith('@bwnapdx.org')) return address;
  if (BWNA_PEOPLE.has(a)) return BWNA_PEOPLE.get(a);
  if (REMOVE.has(a) || PERSONAL_DOMAINS.has(a.split('@')[1])) return null;
  return address; // an outside organization's public address
}

const fixText = (s) => s.replace(EMAIL, (m) => rewriteEmail(m) ?? REMOVED);

function fixChildren(node) {
  if (!node.children) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === 'text') {
      child.value = fixText(child.value);
    } else if (child.type === 'element' && !SKIP.has(child.tagName)) {
      const href = child.tagName === 'a' && String(child.properties?.href ?? '');
      if (href && /^mailto:/i.test(href)) {
        let address = href.slice(7).split('?')[0];
        try { address = decodeURIComponent(address); } catch { /* keep as is */ }
        const replacement = rewriteEmail(address);
        fixChildren(child);
        if (replacement) {
          child.properties.href = `mailto:${replacement}`;
        } else {
          // Unwrap: keep the link text, drop the link.
          node.children.splice(i, 1, ...child.children);
          i += child.children.length - 1;
        }
      } else {
        fixChildren(child);
      }
    }
  }
}

export default function rehypeRedactEmails() {
  return (tree) => fixChildren(tree);
}
