import { Stack, Table, Text, Title } from '@mantine/core';
import { useBookings } from '../../api/queries';
import { QueryBoundary } from '../../components/QueryBoundary';
import { formatDate, formatTime } from '../../lib/format';

export function BookingsPage() {
  const { data, isLoading, error } = useBookings();

  const rows = [...(data ?? [])].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <Stack>
      <div>
        <Title order={2}>Upcoming bookings</Title>
        <Text c="dimmed">All scheduled calls across every event type.</Text>
      </div>

      <QueryBoundary isLoading={isLoading} error={error}>
        {rows.length > 0 ? (
          <Table.ScrollContainer minWidth={600}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>When</Table.Th>
                  <Table.Th>Event type</Table.Th>
                  <Table.Th>Guest</Table.Th>
                  <Table.Th>Email</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((b) => (
                  <Table.Tr key={b.id}>
                    <Table.Td>
                      {formatDate(b.start)} · {formatTime(b.start)}–
                      {formatTime(b.end)}
                    </Table.Td>
                    <Table.Td>{b.eventTypeId}</Table.Td>
                    <Table.Td>{b.guestName}</Table.Td>
                    <Table.Td>{b.guestEmail}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        ) : (
          <Text c="dimmed">No bookings yet.</Text>
        )}
      </QueryBoundary>
    </Stack>
  );
}
