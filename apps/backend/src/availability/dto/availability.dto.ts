import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  Matches,
  ValidateNested,
} from 'class-validator';
import { IsIanaTimezone } from '../../common/validators';
import type {
  AvailabilitySchedule,
  DayAvailability,
  TimeRange,
  Weekday,
} from '../../api/types';

const WEEKDAYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export class TimeRangeDto implements TimeRange {
  @Matches(HHMM, { message: 'start must be "HH:MM"' })
  start!: string;

  @Matches(HHMM, { message: 'end must be "HH:MM"' })
  end!: string;
}

export class DayAvailabilityDto implements DayAvailability {
  @IsIn(WEEKDAYS)
  weekday!: Weekday;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  ranges!: TimeRangeDto[];
}

export class AvailabilityScheduleDto implements AvailabilitySchedule {
  @IsIanaTimezone()
  timezone!: string;

  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => DayAvailabilityDto)
  week!: DayAvailabilityDto[];
}
