import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { toApiError, type Booking, type Slot } from '../../api/client';
import { useCreateBooking, useEventType, useSlots } from '../../api/queries';
import { QueryBoundary } from '../../components/QueryBoundary';
import { SlotPicker } from '../../components/SlotPicker';
import { formatSlotRange } from '../../lib/format';

export function BookingPage() {
  const { eventTypeId = '' } = useParams();
  const eventTypeQuery = useEventType(eventTypeId);
  const slotsQuery = useSlots(eventTypeId);
  const createBooking = useCreateBooking(eventTypeId);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    initialValues: { guestName: '', guestEmail: '' },
    validate: {
      guestName: (v) => (v.trim() ? null : 'Name is required'),
      guestEmail: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Invalid email'),
    },
  });

  function handleSelect(slot: Slot) {
    setSelectedSlot(slot);
    setFormError(null);
    form.reset();
    open();
  }

  function handleSubmit(values: typeof form.values) {
    if (!selectedSlot) return;
    setFormError(null);
    createBooking.mutate(
      { eventTypeId, start: selectedSlot.start, ...values },
      {
        onSuccess: (booking) => {
          close();
          setConfirmed(booking);
          notifications.show({
            color: 'green',
            title: 'Booking confirmed',
            message: formatSlotRange(booking.start, booking.end),
          });
        },
        onError: (err) => setFormError(toApiError(err).message),
      },
    );
  }

  return (
    <Stack>
      <Anchor component={Link} to="/" size="sm">
        ← Back to all calls
      </Anchor>

      <QueryBoundary
        isLoading={eventTypeQuery.isLoading}
        error={eventTypeQuery.error}
      >
        {eventTypeQuery.data && (
          <Stack>
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={2}>{eventTypeQuery.data.title}</Title>
                <Text c="dimmed">{eventTypeQuery.data.description}</Text>
              </div>
              <Badge size="lg" variant="light">
                {eventTypeQuery.data.durationMinutes} min
              </Badge>
            </Group>

            {confirmed ? (
              <Card withBorder radius="md" padding="lg">
                <Title order={4} mb="xs">
                  ✅ You're booked!
                </Title>
                <Text>{formatSlotRange(confirmed.start, confirmed.end)}</Text>
                <Text c="dimmed" size="sm">
                  Confirmation sent to {confirmed.guestEmail}.
                </Text>
                <Button
                  mt="md"
                  variant="light"
                  onClick={() => setConfirmed(null)}
                >
                  Book another time
                </Button>
              </Card>
            ) : (
              <QueryBoundary
                isLoading={slotsQuery.isLoading}
                error={slotsQuery.error}
              >
                <SlotPicker
                  slots={slotsQuery.data ?? []}
                  selectedStart={selectedSlot?.start ?? null}
                  onSelect={handleSelect}
                />
              </QueryBoundary>
            )}
          </Stack>
        )}
      </QueryBoundary>

      <Modal opened={opened} onClose={close} title="Confirm your booking">
        {selectedSlot && (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <Alert variant="light">
                {formatSlotRange(selectedSlot.start, selectedSlot.end)}
              </Alert>
              <TextInput
                label="Your name"
                withAsterisk
                {...form.getInputProps('guestName')}
              />
              <TextInput
                label="Email"
                withAsterisk
                {...form.getInputProps('guestEmail')}
              />
              {formError && (
                <Alert color="red" title="Could not book">
                  {formError}
                </Alert>
              )}
              <Button type="submit" loading={createBooking.isPending}>
                Confirm booking
              </Button>
            </Stack>
          </form>
        )}
      </Modal>
    </Stack>
  );
}
