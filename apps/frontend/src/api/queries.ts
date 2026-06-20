import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api,
  toApiError,
  type AvailabilitySchedule,
  type BookingCreate,
  type EventTypeCreate,
} from './client';

export const queryKeys = {
  eventTypes: ['event-types'] as const,
  eventType: (id: string) => ['event-types', id] as const,
  slots: (id: string) => ['event-types', id, 'slots'] as const,
  availability: ['availability'] as const,
  bookings: ['bookings'] as const,
};

// --- Queries ---------------------------------------------------------------

export function useEventTypes() {
  return useQuery({
    queryKey: queryKeys.eventTypes,
    queryFn: async () => {
      const { data, error } = await api.GET('/event-types');
      if (error) throw toApiError(error);
      return data;
    },
  });
}

export function useEventType(id: string) {
  return useQuery({
    queryKey: queryKeys.eventType(id),
    queryFn: async () => {
      const { data, error } = await api.GET('/event-types/{id}', {
        params: { path: { id } },
      });
      if (error) throw toApiError(error);
      return data;
    },
    enabled: id !== '',
  });
}

export function useSlots(id: string) {
  return useQuery({
    queryKey: queryKeys.slots(id),
    queryFn: async () => {
      const { data, error } = await api.GET('/event-types/{id}/slots', {
        params: { path: { id } },
      });
      if (error) throw toApiError(error);
      return data;
    },
    enabled: id !== '',
  });
}

export function useAvailability() {
  return useQuery({
    queryKey: queryKeys.availability,
    queryFn: async () => {
      const { data, error } = await api.GET('/availability');
      if (error) throw toApiError(error);
      return data;
    },
  });
}

export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings,
    queryFn: async () => {
      const { data, error } = await api.GET('/bookings');
      if (error) throw toApiError(error);
      return data;
    },
  });
}

// --- Mutations -------------------------------------------------------------

export function useCreateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: EventTypeCreate) => {
      const { data, error } = await api.POST('/event-types', { body });
      if (error) throw toApiError(error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.eventTypes }),
  });
}

export function useReplaceAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: AvailabilitySchedule) => {
      const { data, error } = await api.PUT('/availability', { body });
      if (error) throw toApiError(error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.availability }),
  });
}

export function useCreateBooking(eventTypeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: BookingCreate) => {
      const { data, error } = await api.POST('/bookings', { body });
      if (error) throw toApiError(error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.slots(eventTypeId) });
      qc.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}
