import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DateTime } from 'luxon';
import { DomainException } from '../common/domain-exception';
import { StoreService } from '../store/store.service';
import { EventTypesService } from '../event-types/event-types.service';
import { findSlotAtInstant, generateSlots } from '../domain/slots';
import type { Booking } from '../api/types';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly store: StoreService,
    private readonly eventTypes: EventTypesService,
  ) {}

  list(): Booking[] {
    return this.store
      .listBookings()
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  create(dto: CreateBookingDto): Booking {
    // 404 if the event type does not exist.
    const eventType = this.eventTypes.getOrThrow(dto.eventTypeId);

    const start = DateTime.fromISO(dto.start);
    if (!start.isValid) {
      throw DomainException.badRequest(
        'invalid_start',
        'start is not a valid datetime.',
      );
    }

    // Recompute the bookable slots and locate the requested one.
    const slots = generateSlots({
      durationMinutes: eventType.durationMinutes,
      availability: this.store.getAvailability(),
      bookings: this.store.listBookings(),
      now: DateTime.now(),
    });
    const slot = findSlotAtInstant(slots, start.toMillis());

    // 400 when the start is off-grid / outside availability / outside the
    // window / in the past — i.e. not a real slot for this event type.
    if (!slot) {
      throw DomainException.badRequest(
        'invalid_slot',
        'The selected time is not an available slot for this event type.',
      );
    }

    // 409 when the slot overlaps an existing booking (of any event type).
    if (!slot.available) {
      throw DomainException.conflict(
        'slot_taken',
        'That time has already been booked. Please choose another slot.',
      );
    }

    return this.store.addBooking({
      id: randomUUID(),
      eventTypeId: eventType.id,
      guestName: dto.guestName,
      guestEmail: dto.guestEmail,
      start: slot.start,
      end: slot.end,
    });
  }
}
