import type { Transaction } from '@/features/shared/types/domain';
import { projectWalletBalances } from '@/features/transactions/walletProjection';
import { addMoney } from '@/lib/money';

type WalletSummaryCardProps = {
  transactions: Transaction[];
  initialMainBalance?: string;
  initialProjectedBalance?: string;
};

export function WalletSummaryCard({
  transactions,
  initialMainBalance,
  initialProjectedBalance,
}: WalletSummaryCardProps) {
  const projection = projectWalletBalances({
    transactions,
    initialMainBalance,
    initialProjectedBalance,
  });

  let totalIncome = '0.00';
  let totalExpense = '0.00';
  let totalEffective = '0.00';
  let totalPending = '0.00';

  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      totalIncome = addMoney(totalIncome, transaction.amount);
    }

    if (transaction.type === 'expense') {
      totalExpense = addMoney(totalExpense, transaction.amount);
    }

    if (transaction.status === 'effective') {
      totalEffective = addMoney(totalEffective, transaction.amount);
    }

    if (transaction.status === 'pending') {
      totalPending = addMoney(totalPending, transaction.amount);
    }
  }

  return (
    <section aria-label="Resumo da carteira">
      <h3>Resumo da carteira</h3>
      <p>Saldo principal: R$ {projection.mainBalance}</p>
      <p>Saldo projetado: R$ {projection.projectedBalance}</p>
      <p>Total de transacoes: {transactions.length}</p>
      <p>Total de entradas: R$ {totalIncome}</p>
      <p>Total de saidas: R$ {totalExpense}</p>
      <p>Total efetivado: R$ {totalEffective}</p>
      <p>Total pendente: R$ {totalPending}</p>
    </section>
  );
}
