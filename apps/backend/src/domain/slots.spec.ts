import { DateTime } from 'luxon';
import type { AvailabilitySchedule, Booking } from '../api/types';
import { findSlotAtInstant, generateSlots } from './slots';

const availability: AvailabilitySchedule = {
  timezone: 'UTC',
  week: [{ weekday: 'monday', ranges: [{ start: '09:00', end: '11:00' }] }],
};

// 2026-06-15 is a Monday. `endOfDay` bounds tests to that single day, since the
// 14-day window would otherwise also include the following Monday.
const monday = DateTime.fromISO('2026-06-15T00:00:00Z', { zone: 'utc' });
const endOfDay = '2026-06-16T00:00:00Z';

function booking(start: string, end: string): Booking {
  return {
    id: 'b1',
    eventTypeId: 'other',
    guestName: 'X',
    guestEmail: 'x@example.com',
    start,
    end,
  };
}

describe('generateSlots', () => {
  it('slices a range into duration-sized slots on a 30-minute grid', () => {
    const slots = generateSlots({
      durationMinutes: 60,
      availability,
      bookings: [],
      now: monday,
      to: endOfDay,
    });

    expect(slots.map((s) => s.start)).toEqual([
      '2026-06-15T09:00:00.000Z',
      '2026-06-15T09:30:00.000Z',
      '2026-06-15T10:00:00.000Z',
    ]);
    expect(slots.every((s) => s.available)).toBe(true);
  });

  it('marks slots overlapping any booking as unavailable', () => {
    const slots = generateSlots({
      durationMinutes: 60,
      availability,
      bookings: [
        booking('2026-06-15T09:00:00.000Z', '2026-06-15T10:00:00.000Z'),
      ],
      now: monday,
      to: endOfDay,
    });

    expect(slots.map((s) => s.available)).toEqual([false, false, true]);
  });

  it('excludes slots in the past', () => {
    const slots = generateSlots({
      durationMinutes: 60,
      availability,
      bookings: [],
      now: DateTime.fromISO('2026-06-15T09:45:00Z', { zone: 'utc' }),
      to: endOfDay,
    });

    expect(slots.map((s) => s.start)).toEqual(['2026-06-15T10:00:00.000Z']);
  });

  it('excludes slots beyond the 14-day window', () => {
    // A Monday three weeks out is outside the window from `monday`.
    const farAvailability: AvailabilitySchedule = availability;
    const slots = generateSlots({
      durationMinutes: 60,
      availability: farAvailability,
      bookings: [],
      now: monday,
      from: '2026-07-01T00:00:00Z', // narrower than the window, past its end
    });
    expect(slots).toEqual([]);
  });

  it('findSlotAtInstant matches by instant', () => {
    const slots = generateSlots({
      durationMinutes: 60,
      availability,
      bookings: [],
      now: monday,
    });
    const instant = DateTime.fromISO('2026-06-15T09:30:00Z').toMillis();
    expect(findSlotAtInstant(slots, instant)?.start).toBe(
      '2026-06-15T09:30:00.000Z',
    );
    expect(findSlotAtInstant(slots, 0)).toBeUndefined();
  });
});
