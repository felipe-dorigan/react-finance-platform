import { beforeEach, describe, expect, it } from 'vitest';
import { clearAuditStore, listAuditEvents } from '@/features/audit/auditStore';
import { emitAccountMutationTrail } from '@/features/accounts/accountsAuditBridge';
import {
  __resetAccountService,
  __setAccountsForTests,
  listWalletAccounts,
} from '@/features/accounts/accountService';
import { __resetCardService } from '@/features/cards/cardService';
import { hardDeleteAccountAndRecalculate } from '@/features/accounts/accountHardDeleteService';
import type { Transaction } from '@/features/shared/types/domain';

const WALLET_ID = 'wallet-001';

describe('audit immutability after hard-delete', () => {
  beforeEach(() => {
    clearAuditStore();
    __resetAccountService();
    __resetCardService();
  });

  it('preserva eventos de auditoria emitidos antes do hard-delete de conta', async () => {
    __setAccountsForTests([
      {
        id: 'acc-1',
        walletId: WALLET_ID,
        name: 'Conta para exclusao',
        status: 'active',
        balance: '100.00',
      },
    ]);

    emitAccountMutationTrail({
      account: {
        id: 'acc-1',
        walletId: WALLET_ID,
        name: 'Conta para exclusao',
        status: 'active',
        balance: '100.00',
      },
      action: 'account.updated',
      changedFields: [{ field: 'name', before: 'Conta antiga', after: 'Conta para exclusao' }],
    });

    const beforeDeleteAudit = listAuditEvents(WALLET_ID);
    expect(beforeDeleteAudit).toHaveLength(1);

    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        walletId: WALLET_ID,
        type: 'expense',
        status: 'effective',
        amount: '25.00',
        date: '2026-05-29T10:00:00.000Z',
        period: null,
        sourceAccountId: 'acc-1',
        destinationAccountId: null,
        cardId: null,
        cardExpensePaymentStatus: null,
        paidFromAccountId: null,
        paidAt: null,
      },
    ];

    const result = await hardDeleteAccountAndRecalculate({
      walletId: WALLET_ID,
      accountId: 'acc-1',
      transactions,
      initialMainBalance: '100.00',
      initialProjectedBalance: '100.00',
    });

    expect(result.deletedAccountId).toBe('acc-1');
    expect((await listWalletAccounts(WALLET_ID)).find((account) => account.id === 'acc-1')).toBeUndefined();

    const afterDeleteAudit = listAuditEvents(WALLET_ID);
    expect(afterDeleteAudit).toHaveLength(1);
    expect(afterDeleteAudit[0].action).toBe('account.updated');
    expect(afterDeleteAudit[0].entityType).toBe('account');
  });
});
