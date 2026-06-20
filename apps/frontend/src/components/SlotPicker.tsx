import { useMemo, useState } from 'react';
import { Button, Chip, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import type { Slot } from '../api/client';
import { dayKey, formatDate, formatTime, localTzLabel } from '../lib/format';

interface SlotPickerProps {
  slots: Slot[];
  selectedStart: string | null;
  onSelect: (slot: Slot) => void;
}

/** Groups slots by local calendar day and lets the guest pick a free slot. */
export function SlotPicker({
  slots,
  selectedStart,
  onSelect,
}: SlotPickerProps) {
  const days = useMemo(() => {
    const byDay = new Map<string, Slot[]>();
    for (const slot of [...slots].sort((a, b) =>
      a.start.localeCompare(b.start),
    )) {
      const key = dayKey(slot.start);
      const list = byDay.get(key) ?? [];
      list.push(slot);
      byDay.set(key, list);
    }
    return [...byDay.entries()].map(([key, list]) => ({
      key,
      label: formatDate(list[0]!.start),
      slots: list,
    }));
  }, [slots]);

  const [activeDay, setActiveDay] = useState<string | null>(
    days[0]?.key ?? null,
  );

  if (days.length === 0) {
    return <Text c="dimmed">No available times in the next 14 days.</Text>;
  }

  const current = activeDay ?? days[0]!.key;
  const daySlots = days.find((d) => d.key === current)?.slots ?? [];

  return (
    <Stack>
      <div>
        <Text size="sm" fw={500} mb={6}>
          Select a day
        </Text>
        <Chip.Group
          multiple={false}
          value={current}
          onChange={(v) => setActiveDay(v as string)}
        >
          <Group gap="xs">
            {days.map((day) => (
              <Chip key={day.key} value={day.key} variant="outline">
                {day.label}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </div>

      <div>
        <Text size="sm" fw={500} mb={6}>
          Select a time{' '}
          <Text span c="dimmed" size="xs">
            ({localTzLabel})
          </Text>
        </Text>
        <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }} spacing="xs">
          {daySlots.map((slot) => (
            <Button
              key={slot.start}
              size="sm"
              variant={selectedStart === slot.start ? 'filled' : 'default'}
              disabled={!slot.available}
              onClick={() => onSelect(slot)}
            >
              {formatTime(slot.start)}
            </Button>
          ))}
        </SimpleGrid>
      </div>
    </Stack>
  );
}
