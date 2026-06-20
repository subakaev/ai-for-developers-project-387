import { DateTime } from 'luxon';
import type { Weekday } from '../api/types';

/** Rolling booking window length, in days, from "now". */
export const WINDOW_DAYS = 14;

/** Candidate slot start times sit on this minute grid. */
export const GRID_MINUTES = 30;

/** Luxon weekday number (1 = Monday … 7 = Sunday) → contract Weekday. */
export const WEEKDAY_BY_NUMBER: Record<number, Weekday> = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  7: 'sunday',
};

/** Parse "HH:MM" onto a given day (in that day's zone). Returns null if invalid. */
export function atTime(day: DateTime, hhmm: string): DateTime | null {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return day.set({ hour, minute, second: 0, millisecond: 0 });
}

/** True when [aStart, aEnd) and [bStart, bEnd) overlap (half-open intervals). */
export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
