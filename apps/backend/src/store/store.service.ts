import { Injectable } from '@nestjs/common';
import type { AvailabilitySchedule, Booking, EventType } from '../api/types';

/**
 * In-memory data store (no database — data resets on restart, per step 4).
 * A single owner means availability is a singleton.
 */
@Injectable()
export class StoreService {
  private readonly eventTypes = new Map<string, EventType>();
  private readonly bookings: Booking[] = [];
  private availability: AvailabilitySchedule = defaultAvailability();

  constructor() {
    this.seed();
  }

  // --- Event types ---------------------------------------------------------

  listEventTypes(): EventType[] {
    return [...this.eventTypes.values()];
  }

  getEventType(id: string): EventType | undefined {
    return this.eventTypes.get(id);
  }

  hasEventType(id: string): boolean {
    return this.eventTypes.has(id);
  }

  addEventType(eventType: EventType): EventType {
    this.eventTypes.set(eventType.id, eventType);
    return eventType;
  }

  // --- Availability --------------------------------------------------------

  getAvailability(): AvailabilitySchedule {
    return this.availability;
  }

  setAvailability(schedule: AvailabilitySchedule): AvailabilitySchedule {
    this.availability = schedule;
    return this.availability;
  }

  // --- Bookings ------------------------------------------------------------

  listBookings(): Booking[] {
    return [...this.bookings];
  }

  addBooking(booking: Booking): Booking {
    this.bookings.push(booking);
    return booking;
  }

  // --- Seed ----------------------------------------------------------------

  private seed(): void {
    this.addEventType({
      id: 'intro-call',
      title: 'Intro call',
      description: 'A quick 30-minute introduction and Q&A.',
      durationMinutes: 30,
    });
    this.addEventType({
      id: 'deep-dive',
      title: 'Technical deep dive',
      description: 'A focused 60-minute session to go deep on your project.',
      durationMinutes: 60,
    });
  }
}

/** Default working hours: Monday–Friday, 09:00–17:00. */
export function defaultAvailability(): AvailabilitySchedule {
  const workdays: Array<AvailabilitySchedule['week'][number]['weekday']> = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
  ];
  return {
    timezone: 'Europe/Moscow',
    week: workdays.map((weekday) => ({
      weekday,
      ranges: [{ start: '09:00', end: '17:00' }],
    })),
  };
}
