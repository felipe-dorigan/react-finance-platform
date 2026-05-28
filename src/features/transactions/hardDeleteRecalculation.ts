import type { Transaction } from '@/features/shared/types/domain';
import { projectWalletBalances, type WalletProjectionResult } from '@/features/transactions/walletProjection';

export type HardDeleteRecalculationResult = {
  transactions: Transaction[];
  projection: WalletProjectionResult;
};

export type HardDeleteRecalculationInput = {
  transactions: Transaction[];
  initialMainBalance?: string;
  initialProjectedBalance?: string;
};

export function removeTransactionsLinkedToAccount(
  transactions: Transaction[],
  accountId: string,
): Transaction[] {
  return transactions.filter(
    (transaction) =>
      transaction.sourceAccountId !== accountId &&
      transaction.destinationAccountId !== accountId &&
      transaction.paidFromAccountId !== accountId,
  );
}

export function removeTransactionsLinkedToCard(
  transactions: Transaction[],
  cardId: string,
): Transaction[] {
  return transactions.filter((transaction) => transaction.cardId !== cardId);
}

export function recalculateAfterAccountHardDelete(
  input: HardDeleteRecalculationInput,
  accountId: string,
): HardDeleteRecalculationResult {
  const transactions = removeTransactionsLinkedToAccount(input.transactions, accountId);
  const projection = projectWalletBalances({
    initialMainBalance: input.initialMainBalance,
    initialProjectedBalance: input.initialProjectedBalance,
    transactions,
  });

  return {
    transactions,
    projection,
  };
}

export function recalculateAfterCardHardDelete(
  input: HardDeleteRecalculationInput,
  cardId: string,
): HardDeleteRecalculationResult {
  const transactions = removeTransactionsLinkedToCard(input.transactions, cardId);
  const projection = projectWalletBalances({
    initialMainBalance: input.initialMainBalance,
    initialProjectedBalance: input.initialProjectedBalance,
    transactions,
  });

  return {
    transactions,
    projection,
  };
}
