import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { Booking } from '../api/types';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  list(): Booking[] {
    return this.bookings.list();
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateBookingDto): Booking {
    return this.bookings.create(dto);
  }
}
