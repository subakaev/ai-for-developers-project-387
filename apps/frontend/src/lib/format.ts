import dayjs from 'dayjs';

/** Local timezone abbreviation/label for the current browser. */
export const localTzLabel =
  Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'local time';

/** "Mon, 16 Jun 2026" */
export function formatDate(iso: string): string {
  return dayjs(iso).format('ddd, DD MMM YYYY');
}

/** "14:30" */
export function formatTime(iso: string): string {
  return dayjs(iso).format('HH:mm');
}

/** "Mon, 16 Jun 2026 · 14:30–15:00" */
export function formatSlotRange(startIso: string, endIso: string): string {
  return `${formatDate(startIso)} · ${formatTime(startIso)}–${formatTime(endIso)}`;
}

/** Calendar day key, e.g. "2026-06-16", in local time. */
export function dayKey(iso: string): string {
  return dayjs(iso).format('YYYY-MM-DD');
}
