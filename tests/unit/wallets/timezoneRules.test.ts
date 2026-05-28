import { describe, expect, it } from 'vitest';
import {
  DEFAULT_WALLET_TIMEZONE,
  normalizeWalletTimezone,
  walletTimezoneInputSchema,
} from '@/features/wallets/timezone/timezoneSchema';
import {
  getDailyClosingMoment,
  getWalletPeriodBounds,
  resolveWalletTimezone,
  formatWalletLocalDate,
} from '@/features/wallets/timezone/timezoneService';

describe('wallet timezone rules', () => {
  it('normalizes missing timezone to UTC', () => {
    expect(normalizeWalletTimezone(undefined)).toBe(DEFAULT_WALLET_TIMEZONE);
    expect(walletTimezoneInputSchema.parse(' America/Sao_Paulo ')).toBe('America/Sao_Paulo');
  });

  it('resolves valid IANA timezone and computes local bounds', () => {
    expect(resolveWalletTimezone('America/Sao_Paulo')).toBe('America/Sao_Paulo');

    const bounds = getWalletPeriodBounds(new Date('2026-05-28T15:30:00.000Z'), 'America/Sao_Paulo');

    expect(bounds.timezone).toBe('America/Sao_Paulo');
    expect(bounds.start).toBeInstanceOf(Date);
    expect(bounds.end).toBeInstanceOf(Date);
    expect(bounds.start.getTime()).toBeLessThanOrEqual(bounds.end.getTime());
  });

  it('computes daily closing moment and formats local date', () => {
    const closingMoment = getDailyClosingMoment(new Date('2026-05-28T15:30:00.000Z'));

    expect(closingMoment).toBeInstanceOf(Date);
    expect(formatWalletLocalDate(new Date('2026-05-28T15:30:00.000Z'), 'America/Sao_Paulo')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});