import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createWalletTransaction } from '@/features/transactions/transactionService';
import { clearAuditStore, listAuditEvents } from '@/features/audit/auditStore';
import {
  clearWalletMutationJournal,
  listWalletMutations,
} from '@/features/persistence/walletMutationJournal';

const createdTransaction = {
  id: 'tx-900',
  walletId: 'wallet-001',
  type: 'income' as const,
  status: 'effective' as const,
  amount: '150.00',
  date: '2026-05-28T13:00:00.000Z',
  period: 'monthly' as const,
  sourceAccountId: null,
  destinationAccountId: null,
  cardId: null,
  cardExpensePaymentStatus: null,
  paidFromAccountId: null,
  paidAt: null,
};

describe('transaction audit bridge integration', () => {
  beforeEach(() => {
    clearAuditStore();
    clearWalletMutationJournal();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('emite auditoria e journal ao criar transacao', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(createdTransaction), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    const result = await createWalletTransaction('wallet-001', {
      type: 'income',
      status: 'effective',
      amount: '150.00',
      date: '2026-05-28T13:00:00.000Z',
      period: 'monthly',
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
    });

    expect(result.id).toBe('tx-900');

    const auditEvents = listAuditEvents('wallet-001');
    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0]).toMatchObject({
      walletId: 'wallet-001',
      actorUserId: 'user-001',
      actorEmail: 'owner@finance.dev',
      actorRole: 'owner',
      action: 'transaction.created',
      entityType: 'transaction',
      entityId: 'tx-900',
    });

    const mutationEntries = listWalletMutations('wallet-001');
    expect(mutationEntries).toHaveLength(1);
    expect(mutationEntries[0]).toMatchObject({
      walletId: 'wallet-001',
      action: 'transaction.created',
      entityType: 'transaction',
      entityId: 'tx-900',
      payload: {
        type: 'income',
        status: 'effective',
        amount: '150.00',
        date: '2026-05-28T13:00:00.000Z',
        period: 'monthly',
        sourceAccountId: null,
        destinationAccountId: null,
        cardId: null,
      },
    });
  });
});
