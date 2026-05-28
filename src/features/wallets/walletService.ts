import type { Account, Card, Wallet } from '@/features/shared/types/domain';
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

export async function getWalletById(walletId: string): Promise<Wallet> {
  const response = await apiClient.get<Wallet>(`/wallets/${walletId}`);
  return response;
}
