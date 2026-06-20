import { Body, Controller, Get, Put } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityScheduleDto } from './dto/availability.dto';
import type { AvailabilitySchedule } from '../api/types';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Get()
  get(): AvailabilitySchedule {
    return this.availability.get();
  }

  @Put()
  replace(@Body() dto: AvailabilityScheduleDto): AvailabilitySchedule {
    return this.availability.replace(dto);
  }
}
