import { Injectable } from '@nestjs/common';
import { DomainException } from '../common/domain-exception';
import { StoreService } from '../store/store.service';
import type { AvailabilitySchedule } from '../api/types';
import { AvailabilityScheduleDto } from './dto/availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly store: StoreService) {}

  get(): AvailabilitySchedule {
    return this.store.getAvailability();
  }

  replace(dto: AvailabilityScheduleDto): AvailabilitySchedule {
    for (const day of dto.week) {
      for (const range of day.ranges) {
        if (range.start >= range.end) {
          throw DomainException.badRequest(
            'invalid_range',
            `On ${day.weekday}, start "${range.start}" must be before end "${range.end}".`,
          );
        }
      }
    }
    return this.store.setAvailability(dto);
  }
}
