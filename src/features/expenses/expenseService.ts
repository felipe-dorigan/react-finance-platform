import type { Transaction } from '@/features/shared/types/domain';
import { createApiClient } from '@/services/api/client';
import { expenseSchema, payExpenseRequestSchema } from '@/schemas/transactionSchemas';

const apiClient = createApiClient('');

export type Expense = Transaction & {
  type: 'expense';
};

export async function listWalletExpenses(
  walletId: string,
  cardId?: string,
): Promise<Expense[]> {
  const url = new URL(`/wallets/${walletId}/expenses`, 'http://dummy');
  if (cardId) {
    url.searchParams.append('cardId', cardId);
  }

  const path = url.pathname + url.search;
  const response = await apiClient.get<unknown[]>(path);
  return response.map((item) => expenseSchema.parse(item));
}

export async function payCardExpense(
  walletId: string,
  expenseId: string,
  paidFromAccountId: string,
): Promise<Expense> {
  const payload = payExpenseRequestSchema.parse({
    paidFromAccountId,
  });

  const response = await apiClient.patch<unknown>(
    `/wallets/${walletId}/expenses/${expenseId}/pay`,
    payload,
  );
  return expenseSchema.parse(response);
}
