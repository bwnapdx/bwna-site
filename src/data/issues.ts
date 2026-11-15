// Newsletter issue codes ("2012-01") name an issue by its first month.
// Every issue covers two months. Since 2010 they start on odd months
// (Jan-Feb, Mar-Apr, ...). Before that they started on even months
// (Dec-Jan, Feb-Mar, ...), so 2001-12 is the December 2001/January 2002 issue.
// The extraction script (scripts/extract-articles.mjs) has a copy of this
// logic; keep the two in sync.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Issues that don't follow the two-month pattern.
const LABEL_OVERRIDES: Record<string, string> = {
  '2009-10': 'Oct-Dec 2009', // three-month issue bridging to the Jan-Feb schedule
};

/** Display name, e.g. "Jan-Feb 2012" or "Dec 2001-Jan 2002". */
export function issueLabel(slug: string): string {
  if (LABEL_OVERRIDES[slug]) return LABEL_OVERRIDES[slug];
  const [year, month] = slug.split('-').map(Number);
  if (month === 12) return `Dec ${year}-Jan ${year + 1}`;
  return `${MONTHS[month - 1]}-${MONTHS[month]} ${year}`;
}

/**
 * The year an issue is filed under. A Dec-Jan issue counts toward the year it
 * ends in, matching how BWNA filed them (Dec 2001-Jan 2002 is the first 2002
 * issue).
 */
export function issueYear(slug: string): string {
  const [year, month] = slug.split('-').map(Number);
  return String(month === 12 ? year + 1 : year);
}
