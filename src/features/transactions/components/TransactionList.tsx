import type { Transaction } from '@/features/shared/types/domain';
import { useMemo, useState } from 'react';

type TransactionListProps = {
  transactions: Transaction[];
};

export function TransactionList({ transactions }: TransactionListProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'effective' | 'pending'>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      const matchesPeriod =
        periodFilter === 'all'
          ? true
          : periodFilter === 'none'
            ? transaction.period === null
            : transaction.period === periodFilter;

      return matchesStatus && matchesPeriod;
    });
  }, [transactions, statusFilter, periodFilter]);

  if (transactions.length === 0) {
    return <p>Nenhuma transacao cadastrada ate o momento.</p>;
  }

  return (
    <section aria-label="Lista de transacoes">
      <h3>Transacoes</h3>

      <label htmlFor="status-filter">Filtrar por status</label>
      <select
        id="status-filter"
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value as 'all' | 'effective' | 'pending')}
      >
        <option value="all">Todos</option>
        <option value="effective">Efetivada</option>
        <option value="pending">Pendente</option>
      </select>

      <label htmlFor="period-filter">Filtrar por periodo</label>
      <select
        id="period-filter"
        value={periodFilter}
        onChange={(event) =>
          setPeriodFilter(event.target.value as 'all' | 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly')
        }
      >
        <option value="all">Todos</option>
        <option value="none">Sem recorrencia</option>
        <option value="daily">Diario</option>
        <option value="weekly">Semanal</option>
        <option value="monthly">Mensal</option>
        <option value="yearly">Anual</option>
      </select>

      {filteredTransactions.length === 0 ? (
        <p>Nenhuma transacao corresponde aos filtros selecionados.</p>
      ) : (
        <ul>
          {filteredTransactions.map((transaction) => (
            <li key={transaction.id}>
              <strong>{transaction.type}</strong> | {transaction.status} | {transaction.period ?? 'sem-recorrencia'} | R$ {transaction.amount}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
