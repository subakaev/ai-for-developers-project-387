import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { DomainException } from '../common/domain-exception';
import { StoreService } from '../store/store.service';
import { generateSlots } from '../domain/slots';
import type { EventType, Slot } from '../api/types';
import { CreateEventTypeDto } from './dto/create-event-type.dto';

@Injectable()
export class EventTypesService {
  constructor(private readonly store: StoreService) {}

  list(): EventType[] {
    return this.store.listEventTypes();
  }

  getOrThrow(id: string): EventType {
    const eventType = this.store.getEventType(id);
    if (!eventType) {
      throw DomainException.notFound(
        'event_type_not_found',
        `Event type "${id}" was not found.`,
      );
    }
    return eventType;
  }

  create(dto: CreateEventTypeDto): EventType {
    if (this.store.hasEventType(dto.id)) {
      throw DomainException.conflict(
        'duplicate_id',
        `An event type with id "${dto.id}" already exists.`,
      );
    }
    return this.store.addEventType({
      id: dto.id,
      title: dto.title,
      description: dto.description,
      durationMinutes: dto.durationMinutes,
    });
  }

  listSlots(id: string, from?: string, to?: string): Slot[] {
    const eventType = this.getOrThrow(id);
    return generateSlots({
      durationMinutes: eventType.durationMinutes,
      availability: this.store.getAvailability(),
      bookings: this.store.listBookings(),
      now: DateTime.now(),
      from,
      to,
    });
  }
}
