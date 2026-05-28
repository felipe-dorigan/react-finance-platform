import type { Transaction } from '@/features/shared/types/domain';
import { addMoney, subtractMoney } from '@/lib/money';

export type WalletProjectionInput = {
  initialMainBalance?: string;
  initialProjectedBalance?: string;
  transactions: Transaction[];
};

export type WalletProjectionResult = {
  mainBalance: string;
  projectedBalance: string;
};

function applyAmount(balance: string, amount: string, operation: 'add' | 'subtract'): string {
  return operation === 'add' ? addMoney(balance, amount) : subtractMoney(balance, amount);
}

export function projectWalletBalances(input: WalletProjectionInput): WalletProjectionResult {
  let mainBalance = input.initialMainBalance ?? '0.00';
  let projectedBalance = input.initialProjectedBalance ?? '0.00';

  for (const transaction of input.transactions) {
    if (transaction.type === 'transfer') {
      continue;
    }

    const operation = transaction.type === 'income' ? 'add' : 'subtract';
    projectedBalance = applyAmount(projectedBalance, transaction.amount, operation);

    if (transaction.status === 'effective') {
      mainBalance = applyAmount(mainBalance, transaction.amount, operation);
    }
  }

  return { mainBalance, projectedBalance };
}
