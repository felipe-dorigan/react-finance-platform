export type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = dateFormatterCache.get(timeZone);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  dateFormatterCache.set(timeZone, formatter);
  return formatter;
}

export function getZonedDateParts(date: Date, timeZone: string): ZonedDateParts {
  const parts = getFormatter(timeZone).formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
    second: Number(lookup.second),
  };
}

export function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = getZonedDateParts(date, timeZone);
  const utcEquivalent = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return Math.round((utcEquivalent - date.getTime()) / 60000);
}

export function toUtcDateFromZonedParts(parts: ZonedDateParts, timeZone: string): Date {
  const initialGuess = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second),
  );
  const offsetMinutes = getTimeZoneOffsetMinutes(initialGuess, timeZone);
  return new Date(initialGuess.getTime() - offsetMinutes * 60000);
}

export function startOfDayInTimeZone(date: Date, timeZone: string): Date {
  const parts = getZonedDateParts(date, timeZone);
  return toUtcDateFromZonedParts({ ...parts, hour: 0, minute: 0, second: 0 }, timeZone);
}

export function endOfDayInTimeZone(date: Date, timeZone: string): Date {
  const parts = getZonedDateParts(date, timeZone);
  return toUtcDateFromZonedParts({ ...parts, hour: 23, minute: 59, second: 59 }, timeZone);
}

export function addZonedDays(date: Date, timeZone: string, days: number): Date {
  const parts = getZonedDateParts(date, timeZone);
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days, parts.hour, parts.minute, parts.second));
  return new Date(shifted.getTime());
}

export function formatDateInTimeZone(date: Date, timeZone: string): string {
  return getFormatter(timeZone).format(date);
}

export function toUtcISOString(date: Date): string {
  return date.toISOString();
}

export function normalizeToDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input);
}