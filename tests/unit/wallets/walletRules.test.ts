import { describe, expect, it } from 'vitest';
import type { Account, Card, Wallet } from '@/features/shared/types/domain';
import {
  MAX_WALLETS_PER_USER,
  WalletRuleError,
  archiveOperationalRecord,
  canCreateWallet,
  canUseOperationalRecordInNewTransactions,
  enforceWalletCreationLimit,
  reactivateOperationalRecord,
} from '@/features/wallets/walletService';

function createWallet(partial: Partial<Wallet>): Wallet {
  return {
    id: partial.id ?? 'wallet-1',
    ownerId: partial.ownerId ?? 'user-1',
    name: partial.name ?? 'Carteira Principal',
    timezone: partial.timezone ?? 'UTC',
    status: partial.status ?? 'active',
    mainBalance: partial.mainBalance ?? '0.00',
    projectedBalance: partial.projectedBalance ?? '0.00',
  };
}

describe('wallet rules', () => {
  it('allows creation when user has fewer than 2 wallets', () => {
    const existingWallets = [createWallet({ id: 'wallet-1', ownerId: 'user-1' })];

    expect(canCreateWallet(existingWallets, 'user-1')).toBe(true);
    expect(() => enforceWalletCreationLimit(existingWallets, 'user-1')).not.toThrow();
  });

  it('blocks creation when user reaches the maximum of 2 wallets', () => {
    const existingWallets = [
      createWallet({ id: 'wallet-1', ownerId: 'user-1' }),
      createWallet({ id: 'wallet-2', ownerId: 'user-1' }),
      createWallet({ id: 'wallet-3', ownerId: 'other-user' }),
    ];

    expect(MAX_WALLETS_PER_USER).toBe(2);
    expect(canCreateWallet(existingWallets, 'user-1')).toBe(false);
    expect(() => enforceWalletCreationLimit(existingWallets, 'user-1')).toThrowError(WalletRuleError);
  });

  it('archives and reactivates operational records using active-inactive states', () => {
    const account: Account = {
      id: 'account-1',
      walletId: 'wallet-1',
      name: 'Conta Corrente',
      status: 'active',
      balance: '100.00',
    };

    const card: Card = {
      id: 'card-1',
      walletId: 'wallet-1',
      name: 'Cartao Principal',
      debitAccountId: account.id,
      status: 'active',
    };

    const archivedAccount = archiveOperationalRecord(account);
    const archivedCard = archiveOperationalRecord(card);

    expect(archivedAccount.status).toBe('inactive');
    expect(archivedCard.status).toBe('inactive');
    expect(canUseOperationalRecordInNewTransactions(archivedAccount.status)).toBe(false);
    expect(canUseOperationalRecordInNewTransactions(archivedCard.status)).toBe(false);

    const reactivatedAccount = reactivateOperationalRecord(archivedAccount);
    const reactivatedCard = reactivateOperationalRecord(archivedCard);

    expect(reactivatedAccount.status).toBe('active');
    expect(reactivatedCard.status).toBe('active');
    expect(canUseOperationalRecordInNewTransactions(reactivatedAccount.status)).toBe(true);
    expect(canUseOperationalRecordInNewTransactions(reactivatedCard.status)).toBe(true);
  });
});
