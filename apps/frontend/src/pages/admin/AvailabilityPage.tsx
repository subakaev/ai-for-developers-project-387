import {
  ActionIcon,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import {
  toApiError,
  type AvailabilitySchedule,
  type Weekday,
} from '../../api/client';
import { useAvailability, useReplaceAvailability } from '../../api/queries';
import { QueryBoundary } from '../../components/QueryBoundary';

const WEEKDAYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

/** Ensures every weekday is present and ordered for editing. */
function normalize(schedule: AvailabilitySchedule): AvailabilitySchedule {
  return {
    timezone: schedule.timezone || 'UTC',
    week: WEEKDAYS.map((weekday) => {
      const existing = schedule.week.find((d) => d.weekday === weekday);
      return { weekday, ranges: existing?.ranges ?? [] };
    }),
  };
}

function AvailabilityEditor({ initial }: { initial: AvailabilitySchedule }) {
  const replace = useReplaceAvailability();
  const form = useForm({ initialValues: normalize(initial) });

  function handleSubmit(values: AvailabilitySchedule) {
    replace.mutate(
      {
        timezone: values.timezone,
        // Drop empty days so the payload only carries working days.
        week: values.week.filter((d) => d.ranges.length > 0),
      },
      {
        onSuccess: () =>
          notifications.show({
            color: 'green',
            title: 'Availability saved',
            message: 'Your weekly schedule has been updated.',
          }),
        onError: (err) =>
          notifications.show({
            color: 'red',
            title: 'Could not save',
            message: toApiError(err).message,
          }),
      },
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Timezone (IANA)"
          placeholder="Europe/Moscow"
          maw={320}
          {...form.getInputProps('timezone')}
        />

        {form.values.week.map((day, dayIndex) => (
          <Card key={day.weekday} withBorder radius="md" padding="md">
            <Group justify="space-between" mb="sm">
              <Text fw={600} tt="capitalize">
                {day.weekday}
              </Text>
              <Button
                size="xs"
                variant="light"
                onClick={() =>
                  form.insertListItem(`week.${dayIndex}.ranges`, {
                    start: '09:00',
                    end: '17:00',
                  })
                }
              >
                Add hours
              </Button>
            </Group>

            {day.ranges.length === 0 ? (
              <Text c="dimmed" size="sm">
                Day off
              </Text>
            ) : (
              <Stack gap="xs">
                {day.ranges.map((_, rangeIndex) => (
                  <Group key={rangeIndex} gap="xs">
                    <TextInput
                      aria-label="Start time"
                      w={110}
                      placeholder="09:00"
                      {...form.getInputProps(
                        `week.${dayIndex}.ranges.${rangeIndex}.start`,
                      )}
                    />
                    <Text>–</Text>
                    <TextInput
                      aria-label="End time"
                      w={110}
                      placeholder="17:00"
                      {...form.getInputProps(
                        `week.${dayIndex}.ranges.${rangeIndex}.end`,
                      )}
                    />
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      aria-label="Remove hours"
                      onClick={() =>
                        form.removeListItem(
                          `week.${dayIndex}.ranges`,
                          rangeIndex,
                        )
                      }
                    >
                      ✕
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            )}
          </Card>
        ))}

        <Group>
          <Button type="submit" loading={replace.isPending}>
            Save availability
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function AvailabilityPage() {
  const { data, isLoading, error } = useAvailability();

  return (
    <Stack>
      <div>
        <Title order={2}>Availability</Title>
        <Text c="dimmed">
          Weekly working hours used to generate bookable slots.
        </Text>
      </div>

      <QueryBoundary isLoading={isLoading} error={error}>
        {data && <AvailabilityEditor initial={data} />}
      </QueryBoundary>
    </Stack>
  );
}
