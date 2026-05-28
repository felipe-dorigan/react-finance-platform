import { listWalletTransactions } from '@/features/transactions/transactionService';
import type { LinkRecordType } from '@/features/shared/types/domain';

export type CardLinkedRecord = {
  id: string;
  type: LinkRecordType;
  amount: string;
  date: string;
};

export async function listCardLinkedRecords(
  walletId: string,
  cardId: string,
): Promise<CardLinkedRecord[]> {
  const transactions = await listWalletTransactions(walletId);

  return transactions
    .filter((transaction) => transaction.cardId === cardId)
    .filter((transaction) => transaction.type === 'expense' || transaction.type === 'income')
    .map((transaction) => ({
      id: transaction.id,
      type: transaction.type === 'expense' ? 'expense' : 'credit',
      amount: transaction.amount,
      date: transaction.date,
    }));
}
