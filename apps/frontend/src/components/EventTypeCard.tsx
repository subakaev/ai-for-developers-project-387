import { Badge, Button, Card, Group, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { EventType } from '../api/client';

export function EventTypeCard({ eventType }: { eventType: EventType }) {
  return (
    <Card withBorder shadow="sm" radius="md" padding="lg">
      <Group justify="space-between" mb="xs">
        <Text fw={600}>{eventType.title}</Text>
        <Badge variant="light">{eventType.durationMinutes} min</Badge>
      </Group>
      <Text size="sm" c="dimmed" lineClamp={3} mb="md">
        {eventType.description}
      </Text>
      <Button
        component={Link}
        to={`/book/${eventType.id}`}
        variant="light"
        fullWidth
      >
        View times
      </Button>
    </Card>
  );
}
