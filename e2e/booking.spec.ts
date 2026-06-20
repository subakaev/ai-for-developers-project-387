import { expect, test } from '@playwright/test';

/**
 * Main booking scenario, end to end against the real frontend + backend.
 *
 * A fresh backend reseeds on start with an `intro-call` (30 min) event type and
 * Mon–Fri 09:00–17:00 availability, so the next 14 days always offer free slots.
 * We never assert exact clock values (slot times render in the runner's local
 * timezone) — we pick whatever slot the UI shows and follow it through.
 */
test('guest books a slot, it appears for the owner and is no longer offered', async ({
  page,
}) => {
  const guestName = `Ada Lovelace ${Date.now()}`;
  const guestEmail = 'ada@example.com';

  // 1. Catalog → open the intro-call event type.
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Book a call' }),
  ).toBeVisible();

  const introCard = page
    .locator('.mantine-Card-root', { hasText: 'Intro call' })
    .first();
  await introCard.getByRole('link', { name: 'View times' }).click();

  await expect(page).toHaveURL(/\/book\/intro-call$/);
  await expect(page.getByRole('heading', { name: 'Intro call' })).toBeVisible();

  // 2. Pick the first available time slot (the first day is preselected).
  const timeButtons = page.getByRole('button', { name: /^\d{2}:\d{2}$/ });
  const firstFreeSlot = timeButtons.and(page.locator(':enabled')).first();
  await expect(firstFreeSlot).toBeVisible();
  const slotLabel = (await firstFreeSlot.textContent())?.trim() ?? '';
  expect(slotLabel).toMatch(/^\d{2}:\d{2}$/);
  await firstFreeSlot.click();

  // 3. Fill the confirmation form and submit.
  const modal = page.getByRole('dialog', { name: 'Confirm your booking' });
  await expect(modal).toBeVisible();
  await modal.getByLabel('Your name').fill(guestName);
  await modal.getByLabel('Email').fill(guestEmail);
  await modal.getByRole('button', { name: 'Confirm booking' }).click();

  // 4. Confirmation card.
  await expect(
    page.getByRole('heading', { name: /You're booked!/ }),
  ).toBeVisible();
  await expect(
    page.getByText(`Confirmation sent to ${guestEmail}`),
  ).toBeVisible();

  // 5. The owner sees the booking in the upcoming list.
  await page.goto('/admin/bookings');
  await expect(
    page.getByRole('heading', { name: 'Upcoming bookings' }),
  ).toBeVisible();
  const bookingRow = page.getByRole('row').filter({ hasText: guestName });
  await expect(bookingRow).toBeVisible();
  await expect(bookingRow).toContainText('intro-call');

  // 6. The booked time is no longer offered (slot now disabled server-side).
  await page.goto('/book/intro-call');
  const sameTime = page
    .getByRole('button', { name: slotLabel, exact: true })
    .first();
  await expect(sameTime).toBeVisible();
  await expect(sameTime).toBeDisabled();
});
