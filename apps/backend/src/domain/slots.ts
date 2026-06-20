import { DateTime } from 'luxon';
import type { AvailabilitySchedule, Booking, Slot } from '../api/types';
import {
  GRID_MINUTES,
  WEEKDAY_BY_NUMBER,
  WINDOW_DAYS,
  atTime,
  intervalsOverlap,
} from './time';

export interface GenerateSlotsInput {
  durationMinutes: number;
  availability: AvailabilitySchedule;
  bookings: Booking[];
  /** Current instant; injectable for deterministic tests. */
  now: DateTime;
  /** Optional ISO bounds that narrow (never widen) the 14-day window. */
  from?: string;
  to?: string;
}

/**
 * Generate candidate booking slots for an event type.
 *
 * Slots are derived from the availability schedule (interpreted in its IANA
 * timezone), intersected with the rolling 14-day window from `now`, sliced into
 * `durationMinutes` on a 30-minute grid, and emitted as UTC instants. A slot is
 * `available: false` when it overlaps an existing booking of ANY event type.
 */
export function generateSlots(input: GenerateSlotsInput): Slot[] {
  const { durationMinutes, availability, bookings, now } = input;

  const nowMs = now.toMillis();
  const windowStart = clampLower(parseIso(input.from), nowMs);
  const windowEnd = clampUpper(
    parseIso(input.to),
    now.plus({ days: WINDOW_DAYS }).toMillis(),
  );
  if (windowStart >= windowEnd) return [];

  const zone = availability.timezone;
  const bookedIntervals = bookings.map((b) => ({
    start: DateTime.fromISO(b.start).toMillis(),
    end: DateTime.fromISO(b.end).toMillis(),
  }));

  const slots: Slot[] = [];
  let day = DateTime.fromMillis(windowStart, { zone }).startOf('day');
  const lastDay = DateTime.fromMillis(windowEnd, { zone }).startOf('day');

  while (day <= lastDay) {
    const weekday = WEEKDAY_BY_NUMBER[day.weekday];
    const dayAvailability = availability.week.find(
      (d) => d.weekday === weekday,
    );

    for (const range of dayAvailability?.ranges ?? []) {
      const rangeStart = atTime(day, range.start);
      const rangeEnd = atTime(day, range.end);
      if (!rangeStart || !rangeEnd || rangeStart >= rangeEnd) continue;

      let slotStart = rangeStart;
      while (
        slotStart.plus({ minutes: durationMinutes }).toMillis() <=
        rangeEnd.toMillis()
      ) {
        const startMs = slotStart.toMillis();
        const endMs = slotStart.plus({ minutes: durationMinutes }).toMillis();

        if (startMs >= windowStart && startMs >= nowMs && endMs <= windowEnd) {
          const available = !bookedIntervals.some((b) =>
            intervalsOverlap(startMs, endMs, b.start, b.end),
          );
          slots.push({
            start: slotStart.toUTC().toISO()!,
            end: slotStart.plus({ minutes: durationMinutes }).toUTC().toISO()!,
            available,
          });
        }
        slotStart = slotStart.plus({ minutes: GRID_MINUTES });
      }
    }
    day = day.plus({ days: 1 });
  }

  return slots.sort((a, b) => a.start.localeCompare(b.start));
}

/** Find the generated slot whose start equals the given instant (epoch ms). */
export function findSlotAtInstant(
  slots: Slot[],
  startMs: number,
): Slot | undefined {
  return slots.find((s) => DateTime.fromISO(s.start).toMillis() === startMs);
}

function parseIso(iso: string | undefined): number | undefined {
  if (!iso) return undefined;
  const dt = DateTime.fromISO(iso);
  return dt.isValid ? dt.toMillis() : undefined;
}

function clampLower(value: number | undefined, floor: number): number {
  return value === undefined ? floor : Math.max(value, floor);
}

function clampUpper(value: number | undefined, ceil: number): number {
  return value === undefined ? ceil : Math.min(value, ceil);
}
