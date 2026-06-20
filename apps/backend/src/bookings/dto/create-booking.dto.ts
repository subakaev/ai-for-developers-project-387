import { IsEmail, IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import type { components } from '../../api/schema';

type BookingCreate = components['schemas']['BookingCreate'];

export class CreateBookingDto implements BookingCreate {
  @IsString()
  @IsNotEmpty()
  eventTypeId!: string;

  @IsString()
  @IsNotEmpty()
  guestName!: string;

  @IsEmail()
  guestEmail!: string;

  @IsISO8601()
  start!: string;
}
