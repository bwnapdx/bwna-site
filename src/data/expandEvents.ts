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

export function expandEvents(events: EventEntry[]): ExpandedEvent[] {
  const today = startOfToday();
  const horizon = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  const result: ExpandedEvent[] = [];

  for (const entry of events) {
    if (
      entry.data.recurring &&
      entry.data.recurrenceWeek != null &&
      entry.data.recurrenceDay != null &&
      entry.data.recurrenceMonths
    ) {
      let y = today.getFullYear();
      let m = today.getMonth();

      while (new Date(y, m, 1) <= horizon) {
        if (monthMatchesPattern(m, entry.data.recurrenceMonths)) {
          const date = nthWeekdayOfMonth(y, m, entry.data.recurrenceWeek, entry.data.recurrenceDay);
          if (date >= today && date <= horizon) {
            result.push({ entry, date });
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

  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
}
