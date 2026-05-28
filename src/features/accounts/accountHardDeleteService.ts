import { deleteWalletAccount } from '@/features/accounts/accountService';
import type { Transaction } from '@/features/shared/types/domain';
import {
  recalculateAfterAccountHardDelete,
  type HardDeleteRecalculationResult,
} from '@/features/transactions/hardDeleteRecalculation';

export type AccountHardDeletePayload = {
  walletId: string;
  accountId: string;
  transactions: Transaction[];
  initialMainBalance?: string;
  initialProjectedBalance?: string;
};

export type AccountHardDeleteResult = HardDeleteRecalculationResult & {
  deletedAccountId: string;
};

export async function hardDeleteAccountAndRecalculate(
  payload: AccountHardDeletePayload,
): Promise<AccountHardDeleteResult> {
  await deleteWalletAccount(payload.walletId, payload.accountId);

  const recalculation = recalculateAfterAccountHardDelete(
    {
      transactions: payload.transactions,
      initialMainBalance: payload.initialMainBalance,
      initialProjectedBalance: payload.initialProjectedBalance,
    },
    payload.accountId,
  );

  return {
    deletedAccountId: payload.accountId,
    ...recalculation,
  };
}
