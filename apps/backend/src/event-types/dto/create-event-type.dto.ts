import { IsInt, IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsMultipleOf } from '../../common/validators';
import type { EventType } from '../../api/types';

export class CreateEventTypeDto implements EventType {
  @Matches(/^[a-z0-9-]+$/, {
    message: 'id must be a slug (lowercase letters, numbers, dashes)',
  })
  id!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsInt()
  @IsMultipleOf(30)
  durationMinutes!: number;
}
