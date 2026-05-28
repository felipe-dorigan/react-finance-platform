import type { Account, Card, Wallet } from '@/features/shared/types/domain';
import { walletCollectionSchema, walletSchema } from '@/schemas/walletSchemas';
import { ApiError } from '@/services/api/client';
import { createApiClient } from '@/services/api/client';

const apiClient = createApiClient('');
export const MAX_WALLETS_PER_USER = 2;

type OperationalStatus = Account['status'] | Card['status'];

export class WalletRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletRuleError';
  }
}

export type CreateWalletInput = {
  ownerId: string;
  name: string;
  timezone: string;
};

export function canCreateWallet(existingWallets: ReadonlyArray<Pick<Wallet, 'ownerId'>>, ownerId: string): boolean {
  const ownedWalletCount = existingWallets.filter((wallet) => wallet.ownerId === ownerId).length;
  return ownedWalletCount < MAX_WALLETS_PER_USER;
}

export function enforceWalletCreationLimit(
  existingWallets: ReadonlyArray<Pick<Wallet, 'ownerId'>>,
  ownerId: string,
): void {
  if (!canCreateWallet(existingWallets, ownerId)) {
    throw new WalletRuleError(`Wallet limit reached: a user can have at most ${MAX_WALLETS_PER_USER} wallets.`);
  }
}

export function archiveOperationalRecord<T extends { status: OperationalStatus }>(record: T): T {
  return {
    ...record,
    status: 'inactive',
  };
}

export function reactivateOperationalRecord<T extends { status: OperationalStatus }>(record: T): T {
  return {
    ...record,
    status: 'active',
  };
}

export function canUseOperationalRecordInNewTransactions(status: OperationalStatus): boolean {
  return status === 'active';
}

export async function listWallets(): Promise<Wallet[]> {
  const response = await apiClient.get<unknown[]>('/wallets');
  return walletCollectionSchema.parse(response);
}

export async function createWallet(input: CreateWalletInput): Promise<Wallet> {
  const existingWallets = await listWallets();
  enforceWalletCreationLimit(existingWallets, input.ownerId);

  try {
    const response = await apiClient.post<unknown>('/wallets', {
      ownerId: input.ownerId,
      name: input.name,
      timezone: input.timezone,
    });

    return walletSchema.parse(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      throw new WalletRuleError(`Wallet limit reached: a user can have at most ${MAX_WALLETS_PER_USER} wallets.`);
    }

    throw error;
  }
}

export async function getWalletById(walletId: string): Promise<Wallet> {
  const response = await apiClient.get<unknown>(`/wallets/${walletId}`);
  return walletSchema.parse(response);
}
