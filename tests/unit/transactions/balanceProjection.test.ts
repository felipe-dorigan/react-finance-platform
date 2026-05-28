import { describe, expect, it } from 'vitest';
import type { Transaction } from '@/features/shared/types/domain';
import { projectWalletBalances } from '@/features/transactions/walletProjection';

function createTransaction(partial: Partial<Transaction>): Transaction {
  return {
    id: partial.id ?? 'tx-1',
    walletId: partial.walletId ?? 'wallet-001',
    type: partial.type ?? 'income',
    status: partial.status ?? 'effective',
    amount: partial.amount ?? '0.00',
    date: partial.date ?? '2026-05-28T12:00:00.000Z',
    period: partial.period ?? null,
    sourceAccountId: partial.sourceAccountId ?? null,
    destinationAccountId: partial.destinationAccountId ?? null,
    cardId: partial.cardId ?? null,
    cardExpensePaymentStatus: partial.cardExpensePaymentStatus ?? null,
    paidFromAccountId: partial.paidFromAccountId ?? null,
    paidAt: partial.paidAt ?? null,
  };
}

describe('wallet balance projection', () => {
  it('applies effective transactions to main and projected balances', () => {
    const result = projectWalletBalances({
      initialMainBalance: '1000.00',
      initialProjectedBalance: '1000.00',
      transactions: [
        createTransaction({ type: 'income', status: 'effective', amount: '200.00' }),
        createTransaction({ id: 'tx-2', type: 'expense', status: 'effective', amount: '50.00' }),
      ],
    });

    expect(result.mainBalance).toBe('1150.00');
    expect(result.projectedBalance).toBe('1150.00');
  });

  it('applies pending transactions only to projected balance', () => {
    const result = projectWalletBalances({
      initialMainBalance: '1000.00',
      initialProjectedBalance: '1000.00',
      transactions: [
        createTransaction({ type: 'expense', status: 'pending', amount: '300.00' }),
      ],
    });

    expect(result.mainBalance).toBe('1000.00');
    expect(result.projectedBalance).toBe('700.00');
  });

  it('ignores transfers for aggregated wallet balance totals', () => {
    const result = projectWalletBalances({
      initialMainBalance: '900.00',
      initialProjectedBalance: '900.00',
      transactions: [
        createTransaction({
          type: 'transfer',
          status: 'effective',
          amount: '100.00',
          sourceAccountId: 'account-001',
          destinationAccountId: 'account-002',
        }),
      ],
    });

    expect(result.mainBalance).toBe('900.00');
    expect(result.projectedBalance).toBe('900.00');
  });
});
