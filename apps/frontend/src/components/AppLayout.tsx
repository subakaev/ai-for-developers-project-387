import {
  Anchor,
  AppShell,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  Link,
  NavLink as RouterNavLink,
  Outlet,
  useLocation,
} from 'react-router-dom';

const guestLinks = [{ to: '/', label: 'Browse & book', end: true }];

const ownerLinks = [
  { to: '/admin/bookings', label: 'Upcoming bookings' },
  { to: '/admin/event-types', label: 'Event types' },
  { to: '/admin/availability', label: 'Availability' },
];

export function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" gap="sm">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Anchor component={Link} to="/" underline="never" c="inherit">
            <Title order={3}>📞 Calendar of Calls</Title>
          </Anchor>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Text size="xs" tt="uppercase" c="dimmed" fw={700} mb={4}>
            Guest
          </Text>
          {guestLinks.map((l) => (
            <NavLink
              key={l.to}
              component={RouterNavLink}
              to={l.to}
              end={l.end}
              label={l.label}
              onClick={close}
              active={location.pathname === '/'}
            />
          ))}
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea} mt="md">
          <Text size="xs" tt="uppercase" c="dimmed" fw={700} mb={4}>
            Owner
          </Text>
          {ownerLinks.map((l) => (
            <NavLink
              key={l.to}
              component={RouterNavLink}
              to={l.to}
              label={l.label}
              onClick={close}
              active={location.pathname === l.to}
            />
          ))}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
