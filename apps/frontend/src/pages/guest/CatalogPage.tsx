import { SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useEventTypes } from '../../api/queries';
import { EventTypeCard } from '../../components/EventTypeCard';
import { QueryBoundary } from '../../components/QueryBoundary';

export function CatalogPage() {
  const { data, isLoading, error } = useEventTypes();

  return (
    <Stack>
      <div>
        <Title order={2}>Book a call</Title>
        <Text c="dimmed">Pick a meeting type to see available times.</Text>
      </div>

      <QueryBoundary isLoading={isLoading} error={error}>
        {data && data.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {data.map((et) => (
              <EventTypeCard key={et.id} eventType={et} />
            ))}
          </SimpleGrid>
        ) : (
          <Text c="dimmed">No event types yet.</Text>
        )}
      </QueryBoundary>
    </Stack>
  );
}
