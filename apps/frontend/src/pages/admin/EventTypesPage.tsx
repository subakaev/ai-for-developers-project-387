import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { toApiError } from '../../api/client';
import { useCreateEventType, useEventTypes } from '../../api/queries';
import { QueryBoundary } from '../../components/QueryBoundary';

const DURATIONS = ['30', '60', '90', '120'];

export function EventTypesPage() {
  const { data, isLoading, error } = useEventTypes();
  const createEventType = useCreateEventType();
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      id: '',
      title: '',
      description: '',
      durationMinutes: '30',
    },
    validate: {
      id: (v) =>
        /^[a-z0-9-]+$/.test(v) ? null : 'Lowercase letters, numbers, dashes',
      title: (v) => (v.trim() ? null : 'Title is required'),
      description: (v) => (v.trim() ? null : 'Description is required'),
    },
  });

  function openCreate() {
    form.reset();
    open();
  }

  function handleSubmit(values: typeof form.values) {
    createEventType.mutate(
      {
        id: values.id,
        title: values.title,
        description: values.description,
        durationMinutes: Number(values.durationMinutes),
      },
      {
        onSuccess: (created) => {
          close();
          notifications.show({
            color: 'green',
            title: 'Event type created',
            message: created.title,
          });
        },
        onError: (err) => {
          const apiError = toApiError(err);
          form.setFieldError(
            apiError.code === 'duplicate_id' ? 'id' : 'title',
            apiError.message,
          );
        },
      },
    );
  }

  return (
    <Stack>
      <Group justify="space-between">
        <div>
          <Title order={2}>Event types</Title>
          <Text c="dimmed">Meeting types guests can book.</Text>
        </div>
        <Button onClick={openCreate}>New event type</Button>
      </Group>

      <QueryBoundary isLoading={isLoading} error={error}>
        {data && data.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Title</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Duration</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((et) => (
                <Table.Tr key={et.id}>
                  <Table.Td>
                    <Text ff="monospace" size="sm">
                      {et.id}
                    </Text>
                  </Table.Td>
                  <Table.Td>{et.title}</Table.Td>
                  <Table.Td>{et.description}</Table.Td>
                  <Table.Td>{et.durationMinutes} min</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed">No event types yet. Create your first one.</Text>
        )}
      </QueryBoundary>

      <Modal opened={opened} onClose={close} title="New event type">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="ID (slug)"
              placeholder="intro-call"
              withAsterisk
              {...form.getInputProps('id')}
            />
            <TextInput
              label="Title"
              placeholder="Intro call"
              withAsterisk
              {...form.getInputProps('title')}
            />
            <Textarea
              label="Description"
              autosize
              minRows={2}
              withAsterisk
              {...form.getInputProps('description')}
            />
            <Select
              label="Duration"
              data={DURATIONS.map((d) => ({ value: d, label: `${d} min` }))}
              allowDeselect={false}
              {...form.getInputProps('durationMinutes')}
            />
            <Button type="submit" loading={createEventType.isPending}>
              Create
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
