import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import type { EventType, Slot } from '../api/types';

@Controller('event-types')
export class EventTypesController {
  constructor(private readonly eventTypes: EventTypesService) {}

  @Get()
  list(): EventType[] {
    return this.eventTypes.list();
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateEventTypeDto): EventType {
    return this.eventTypes.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string): EventType {
    return this.eventTypes.getOrThrow(id);
  }

  @Get(':id/slots')
  listSlots(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Slot[] {
    return this.eventTypes.listSlots(id, from, to);
  }
}
