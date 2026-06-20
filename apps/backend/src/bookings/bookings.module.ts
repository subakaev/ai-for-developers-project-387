import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { EventTypesModule } from '../event-types/event-types.module';

@Module({
  imports: [EventTypesModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
