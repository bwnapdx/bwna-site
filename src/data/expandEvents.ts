import type { CollectionEntry } from 'astro:content';

type EventEntry = CollectionEntry<'events'>;

export interface ExpandedEvent {
  /** Original content collection entry */
  entry: EventEntry;
  /** The concrete date for this occurrence */
  date: Date;
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

export function expandEvents(events: EventEntry[]): ExpandedEvent[] {
  const now = new Date();
  const horizon = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const result: ExpandedEvent[] = [];

  for (const entry of events) {
    if (
      entry.data.recurring &&
      entry.data.recurrenceWeek != null &&
      entry.data.recurrenceDay != null &&
      entry.data.recurrenceMonths
    ) {
      let y = now.getFullYear();
      let m = now.getMonth();

      while (new Date(y, m, 1) <= horizon) {
        if (monthMatchesPattern(m, entry.data.recurrenceMonths)) {
          const date = nthWeekdayOfMonth(y, m, entry.data.recurrenceWeek, entry.data.recurrenceDay);
          if (date >= now && date <= horizon) {
            result.push({ entry, date });
          }
        }
        m++;
        if (m > 11) { m = 0; y++; }
      }
    } else {
      // Non-recurring: use as-is
      const date = entry.data.date;
      if (date >= now || (entry.data.endDate && entry.data.endDate >= now)) {
        result.push({ entry, date });
      }
    }
  }

  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
}
