import createClient from 'openapi-fetch';
import type { paths, components } from './schema';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const api = createClient<paths>({ baseUrl });

// Convenient aliases for the contract's domain models.
export type EventType = components['schemas']['EventType'];
export type EventTypeCreate = components['schemas']['EventTypeCreate'];
export type Slot = components['schemas']['Slot'];
export type Booking = components['schemas']['Booking'];
export type BookingCreate = components['schemas']['BookingCreate'];
export type AvailabilitySchedule =
  components['schemas']['AvailabilitySchedule'];
export type DayAvailability = components['schemas']['DayAvailability'];
export type TimeRange = components['schemas']['TimeRange'];
export type Weekday = components['schemas']['Weekday'];
export type ApiError = components['schemas']['ApiError'];

/** Narrow an openapi-fetch error payload to our ApiError shape. */
export function toApiError(error: unknown): ApiError {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error
  ) {
    return error as ApiError;
  }
  return { code: 'unknown', message: 'Unexpected error. Please try again.' };
}
