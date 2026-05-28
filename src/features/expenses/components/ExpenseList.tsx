import { useState } from 'react';
import type { Card } from '@/features/shared/types/domain';
import type { Expense } from '@/features/expenses/expenseService';
import { PayExpenseAction } from '@/features/expenses/components/PayExpenseAction';

type ExpenseListProps = {
  expenses: Expense[];
  cards: Card[];
  accounts: Array<{ id: string; name: string }>;
  walletId: string;
  onExpensePaid?: (expenseId: string) => void;
};

export function ExpenseList({
  expenses,
  cards,
  accounts,
  walletId,
  onExpensePaid,
}: ExpenseListProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);

  const filteredExpenses =
    selectedCardId === null ? expenses : expenses.filter((exp) => exp.cardId === selectedCardId);

  if (expenses.length === 0) {
    return (
      <section aria-label="Listagem de despesas">
        <h3>Despesas</h3>
        <p>Nenhuma despesa cadastrada até o momento.</p>
      </section>
    );
  }

  return (
    <section aria-label="Listagem de despesas">
      <h3>Despesas</h3>

      {/* Filtro por cartão */}
      <div>
        <label htmlFor="card-filter">Filtrar por cartão:</label>
        <select
          id="card-filter"
          value={selectedCardId || ''}
          onChange={(e) => setSelectedCardId(e.target.value || null)}
        >
          <option value="">Todas</option>
          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.name}
            </option>
          ))}
        </select>
      </div>

      {filteredExpenses.length === 0 ? (
        <p>Nenhuma despesa encontrada para o filtro selecionado.</p>
      ) : (
        <ul aria-label="Lista de despesas filtradas">
          {filteredExpenses.map((expense) => (
            <li key={expense.id}>
              <div>
                <strong>R$ {expense.amount}</strong> | {expense.date} | Status:{' '}
                {expense.cardExpensePaymentStatus === 'paid' ? 'Paga' : 'Não paga'}
              </div>

              {expense.cardExpensePaymentStatus === 'unpaid' && (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedExpenseId(
                      expandedExpenseId === expense.id ? null : expense.id,
                    )
                  }
                >
                  {expandedExpenseId === expense.id ? 'Ocultar' : 'Pagar'}
                </button>
              )}

              {expandedExpenseId === expense.id && expense.cardExpensePaymentStatus === 'unpaid' && (
                <PayExpenseAction
                  walletId={walletId}
                  expenseId={expense.id}
                  expenseAmount={expense.amount}
                  accounts={accounts}
                  onSuccess={() => {
                    setExpandedExpenseId(null);
                    onExpensePaid?.(expense.id);
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
