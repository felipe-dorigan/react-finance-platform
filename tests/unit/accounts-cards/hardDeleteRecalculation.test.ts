import { describe, expect, it } from 'vitest';
import type { Transaction } from '@/features/shared/types/domain';
import {
  recalculateAfterAccountHardDelete,
  recalculateAfterCardHardDelete,
} from '@/features/transactions/hardDeleteRecalculation';

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

describe('hard-delete recalculation', () => {
  it('remove vinculos da conta excluida e recalcula agregados da carteira', () => {
    const transactions: Transaction[] = [
      createTransaction({ id: 'tx-1', type: 'income', status: 'effective', amount: '100.00', sourceAccountId: 'acc-1' }),
      createTransaction({ id: 'tx-2', type: 'expense', status: 'effective', amount: '20.00', sourceAccountId: 'acc-2' }),
      createTransaction({
        id: 'tx-3',
        type: 'transfer',
        status: 'effective',
        amount: '30.00',
        sourceAccountId: 'acc-1',
        destinationAccountId: 'acc-2',
      }),
      createTransaction({ id: 'tx-4', type: 'expense', status: 'pending', amount: '10.00', sourceAccountId: 'acc-1' }),
    ];

    const result = recalculateAfterAccountHardDelete(
      {
        initialMainBalance: '0.00',
        initialProjectedBalance: '0.00',
        transactions,
      },
      'acc-1',
    );

    expect(result.transactions.map((transaction) => transaction.id)).toEqual(['tx-2']);
    expect(result.projection.mainBalance).toBe('-20.00');
    expect(result.projection.projectedBalance).toBe('-20.00');
  });

  it('remove despesas e estornos vinculados ao cartao excluido e recalcula agregados', () => {
    const transactions: Transaction[] = [
      createTransaction({
        id: 'tx-10',
        type: 'expense',
        status: 'effective',
        amount: '120.00',
        sourceAccountId: 'acc-2',
        cardId: 'card-1',
      }),
      createTransaction({
        id: 'tx-11',
        type: 'income',
        status: 'effective',
        amount: '40.00',
        sourceAccountId: 'acc-2',
        cardId: 'card-1',
      }),
      createTransaction({
        id: 'tx-12',
        type: 'expense',
        status: 'effective',
        amount: '25.00',
        sourceAccountId: 'acc-2',
        cardId: 'card-2',
      }),
      createTransaction({
        id: 'tx-13',
        type: 'income',
        status: 'pending',
        amount: '10.00',
        sourceAccountId: 'acc-2',
      }),
    ];

    const result = recalculateAfterCardHardDelete(
      {
        initialMainBalance: '0.00',
        initialProjectedBalance: '0.00',
        transactions,
      },
      'card-1',
    );

    expect(result.transactions.map((transaction) => transaction.id)).toEqual(['tx-12', 'tx-13']);
    expect(result.projection.mainBalance).toBe('-25.00');
    expect(result.projection.projectedBalance).toBe('-15.00');
  });
});
