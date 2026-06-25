import dayjs from 'dayjs';

const DISPLAY_LOCALE = 'en-GB';

/** Local timezone label for the current browser. */
export const localTzLabel =
  Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'local time';

function formatInTimeZone(
  iso: string,
  timeZone: string | undefined,
  options: Intl.DateTimeFormatOptions,
): string | undefined {
  if (!timeZone) return undefined;
  try {
    return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
      timeZone,
      ...options,
    }).format(new Date(iso));
  } catch {
    return undefined;
  }
}

function datePartsInTimeZone(
  iso: string,
  timeZone: string | undefined,
): { year: string; month: string; day: string } | null {
  if (!timeZone) return null;
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(iso));
  } catch {
    return null;
  }
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return year && month && day ? { year, month, day } : null;
}

/** "Mon, 16 Jun 2026" */
export function formatDate(iso: string, timeZone?: string): string {
  return (
    formatInTimeZone(iso, timeZone, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) || dayjs(iso).format('ddd, DD MMM YYYY')
  );
}

/** "14:30" */
export function formatTime(iso: string, timeZone?: string): string {
  return (
    formatInTimeZone(iso, timeZone, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) || dayjs(iso).format('HH:mm')
  );
}

/** "Mon, 16 Jun 2026 · 14:30–15:00" */
export function formatSlotRange(
  startIso: string,
  endIso: string,
  timeZone?: string,
): string {
  return `${formatDate(startIso, timeZone)} · ${formatTime(startIso, timeZone)}–${formatTime(endIso, timeZone)}`;
}

/** Calendar day key, e.g. "2026-06-16", in local time. */
export function dayKey(iso: string, timeZone?: string): string {
  const parts = datePartsInTimeZone(iso, timeZone);
  return parts
    ? `${parts.year}-${parts.month}-${parts.day}`
    : dayjs(iso).format('YYYY-MM-DD');
}
