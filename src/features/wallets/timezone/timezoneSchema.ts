import { z } from 'zod';
import { isValidTimeZone } from '@/lib/dates';

export const DEFAULT_WALLET_TIMEZONE = 'UTC';

export const walletTimezoneInputSchema = z
  .string()
  .trim()
  .default(DEFAULT_WALLET_TIMEZONE)
  .refine((value) => isValidTimeZone(value), 'Timezone IANA inválido');

export function normalizeWalletTimezone(timezone?: string | null): string {
  const rawTimezone = timezone?.trim() || DEFAULT_WALLET_TIMEZONE;
  return walletTimezoneInputSchema.parse(rawTimezone);
}