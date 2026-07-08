import type { CollectionEntry } from 'astro:content';

type EventEntry = CollectionEntry<'events'>;

export interface ExpandedEvent {
  /** Original content collection entry */
  entry: EventEntry;
  /** The concrete date for this occurrence (local midnight on the event day) */
  date: Date;
}

/**
 * YAML date-only values (`2026-05-17`) parse as midnight UTC, which renders as
 * the previous day in negative-offset timezones and gets filtered as "past" too
 * early. Reinterpret as midnight local time on the same calendar day.
 */
export function toLocalDate(d: Date): Date {
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function nthWeekdayOfMonth(year: number, month: number, week: number, day: number): Date {
  const first = new Date(year, month, 1);
  const offset = (day - first.getDay() + 7) % 7;
  const date = 1 + offset + (week - 1) * 7;
  return new Date(year, month, date);
}

function monthMatchesPattern(month: number, pattern: 'all' | 'even' | 'odd'): boolean {
  // month is 0-indexed, but "even/odd" refers to the calendar month number (1-indexed)
  const calMonth = month + 1;
  if (pattern === 'even') return calMonth % 2 === 0;
  if (pattern === 'odd') return calMonth % 2 !== 0;
  return true;
}

/** Stable key for a single occurrence, so a one-off can override a recurring date. */
function occurrenceKey(title: string, date: Date): string {
  return `${title}::${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * Minutes-since-midnight of an event's start time, parsed from the free-form
 * `time` string ("7:00 PM", "9:00 AM - 3:00 PM", "Noon - 2:00 PM"). Used only as
 * a same-day tiebreaker for ordering. Unparseable values ("Times vary") sort last.
 */
function parseStartMinutes(time: string): number {
  const start = time.split('-')[0].trim();
  if (/noon/i.test(start)) return 12 * 60;
  if (/midnight/i.test(start)) return 0;
  const m = start.match(/(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)/i);
  if (!m) return 24 * 60; // e.g. "Times vary" — order after timed events
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3].toLowerCase().replace(/\./g, '');
  if (meridiem === 'pm' && h !== 12) h += 12;
  if (meridiem === 'am' && h === 12) h = 0;
  return h * 60 + min;
}

export function expandEvents(events: EventEntry[]): ExpandedEvent[] {
  const today = startOfToday();
  const horizon = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  // A one-off entry claims its (title, day); a recurring rule skips that day so
  // the two don't double-book (e.g. a July board meeting with a guest speaker
  // replaces the generic recurring occurrence).
  const overridden = new Set<string>();
  for (const entry of events) {
    if (!entry.data.recurring) {
      overridden.add(occurrenceKey(entry.data.title, toLocalDate(entry.data.date)));
    }
  }

  const result: ExpandedEvent[] = [];

  for (const entry of events) {
    if (
      entry.data.recurring &&
      entry.data.recurrenceWeek != null &&
      entry.data.recurrenceDay != null &&
      entry.data.recurrenceMonths
    ) {
      const weeks = Array.isArray(entry.data.recurrenceWeek)
        ? entry.data.recurrenceWeek
        : [entry.data.recurrenceWeek];
      // A series may be bounded: `date` is its earliest occurrence, `endDate` its latest.
      const lower = new Date(Math.max(today.getTime(), toLocalDate(entry.data.date).getTime()));
      const upper = entry.data.endDate
        ? new Date(Math.min(horizon.getTime(), toLocalDate(entry.data.endDate).getTime()))
        : horizon;

      let y = lower.getFullYear();
      let m = lower.getMonth();

      while (new Date(y, m, 1) <= upper) {
        if (monthMatchesPattern(m, entry.data.recurrenceMonths)) {
          for (const week of weeks) {
            const date = nthWeekdayOfMonth(y, m, week, entry.data.recurrenceDay);
            // An nth-weekday can spill into the next month (e.g. a nonexistent 5th
            // week) — keep only dates that land in the month we're generating.
            if (date.getMonth() !== m) continue;
            if (date >= lower && date <= upper && !overridden.has(occurrenceKey(entry.data.title, date))) {
              result.push({ entry, date });
            }
          }
        }
        m++;
        if (m > 11) { m = 0; y++; }
      }
    } else {
      const date = toLocalDate(entry.data.date);
      const endDate = entry.data.endDate ? toLocalDate(entry.data.endDate) : undefined;
      if (date >= today || (endDate && endDate >= today)) {
        result.push({ entry, date });
      }
    }
  }

  return result.sort((a, b) => {
    const byDate = a.date.getTime() - b.date.getTime();
    if (byDate !== 0) return byDate;
    return parseStartMinutes(a.entry.data.time) - parseStartMinutes(b.entry.data.time);
  });
}
