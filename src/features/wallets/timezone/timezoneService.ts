import { addZonedDays, endOfDayInTimeZone, formatDateInTimeZone, startOfDayInTimeZone } from '@/lib/dates';
import { DEFAULT_WALLET_TIMEZONE, normalizeWalletTimezone } from './timezoneSchema';

export function resolveWalletTimezone(timezone?: string | null): string {
  return normalizeWalletTimezone(timezone ?? DEFAULT_WALLET_TIMEZONE);
}

export function getWalletPeriodBounds(date: Date, timezone?: string | null) {
  const resolvedTimezone = resolveWalletTimezone(timezone);

  return {
    start: startOfDayInTimeZone(date, resolvedTimezone),
    end: endOfDayInTimeZone(date, resolvedTimezone),
    timezone: resolvedTimezone,
  };
}

export function getWalletRecurrenceWindow(date: Date, timezone?: string | null, days = 1) {
  const resolvedTimezone = resolveWalletTimezone(timezone);
  const start = startOfDayInTimeZone(date, resolvedTimezone);
  const end = endOfDayInTimeZone(addZonedDays(date, resolvedTimezone, days - 1), resolvedTimezone);

  return { start, end, timezone: resolvedTimezone };
}

export function getDailyClosingMoment(date: Date, timezone?: string | null): Date {
  const resolvedTimezone = resolveWalletTimezone(timezone);
  return endOfDayInTimeZone(date, resolvedTimezone);
}

export function formatWalletLocalDate(date: Date, timezone?: string | null): string {
  return formatDateInTimeZone(date, resolveWalletTimezone(timezone));
}