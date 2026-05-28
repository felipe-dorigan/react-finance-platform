import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { ExpenseList } from '@/features/expenses/components/ExpenseList';
import * as expenseService from '@/features/expenses/expenseService';
import type { Card } from '@/features/shared/types/domain';
import type { Expense } from '@/features/expenses/expenseService';

function renderExpenseFlow(props: Parameters<typeof ExpenseList>[0]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ExpenseList {...props} />
    </QueryClientProvider>,
  );
}

describe('pay card expense flow', () => {
  const mockWalletId = 'wallet-001';
  const mockExpenseId = 'exp-001';
  const mockCardId = 'card-001';
  const mockExpenseAmount = '150.00';
  const mockAccounts = [
    { id: 'acc-001', name: 'Conta Corrente' },
    { id: 'acc-002', name: 'Conta Poupança' },
  ];

  const mockCards: Card[] = [
    {
      id: mockCardId,
      walletId: mockWalletId,
      name: 'Cartão Principal',
      debitAccountId: 'acc-001',
      status: 'active',
    },
  ];

  const mockExpenses: Expense[] = [
    {
      id: mockExpenseId,
      walletId: mockWalletId,
      type: 'expense',
      status: 'effective',
      amount: mockExpenseAmount,
      date: '2026-05-28T00:00:00.000Z',
      period: null,
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: mockCardId,
      cardExpensePaymentStatus: 'unpaid',
      paidFromAccountId: null,
      paidAt: null,
    },
  ];

  const paidExpense = {
    id: mockExpenseId,
    walletId: mockWalletId,
    type: 'expense' as const,
    status: 'effective' as const,
    amount: mockExpenseAmount,
    date: '2026-05-28T00:00:00.000Z',
    period: null,
    sourceAccountId: null,
    destinationAccountId: null,
    cardId: 'card-001',
    cardExpensePaymentStatus: 'paid' as const,
    paidFromAccountId: 'acc-001',
    paidAt: '2026-05-28T10:00:00.000Z',
  };

  it('abre o fluxo de pagamento a partir da listagem', async () => {
    const user = userEvent.setup();

    renderExpenseFlow({
      expenses: mockExpenses,
      cards: mockCards,
      accounts: mockAccounts,
      walletId: mockWalletId,
    });

    await user.click(screen.getByRole('button', { name: 'Pagar' }));

    expect(screen.getByText('Pagar despesa')).toBeInTheDocument();
    expect(screen.getByLabelText('Conta para débito:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pagar' })).toBeInTheDocument();
  });

  it('paga despesa com débito em conta e atualiza status no histórico', async () => {
    const user = userEvent.setup();
    const onExpensePaid = vi.fn();
    const payCardExpenseSpy = vi
      .spyOn(expenseService, 'payCardExpense')
      .mockResolvedValueOnce(paidExpense);

    renderExpenseFlow({
      expenses: mockExpenses,
      cards: mockCards,
      accounts: mockAccounts,
      walletId: mockWalletId,
      onExpensePaid,
    });

    await user.click(screen.getByRole('button', { name: 'Pagar' }));

    const accountSelect = screen.getByLabelText('Conta para débito:');
    const payButton = screen.getByRole('button', { name: 'Pagar' });

    expect(payButton).toBeDisabled();

    await user.selectOptions(accountSelect, 'acc-001');
    await user.click(payButton);

    await waitFor(() => {
      expect(screen.getByTestId('expense-status-exp-001')).toHaveTextContent('Paga');
    });
    await waitFor(() => {
      expect(payCardExpenseSpy).toHaveBeenCalledWith(mockWalletId, mockExpenseId, 'acc-001');
      expect(onExpensePaid).toHaveBeenCalledWith(mockExpenseId);
      expect(screen.queryByRole('button', { name: 'Pagar' })).not.toBeInTheDocument();
    });
  });

  it('mostra feedback de erro quando pagamento falha', async () => {
    const user = userEvent.setup();

    vi.spyOn(expenseService, 'payCardExpense').mockRejectedValueOnce(new Error('API Error'));

    renderExpenseFlow({
      expenses: mockExpenses,
      cards: mockCards,
      accounts: mockAccounts,
      walletId: mockWalletId,
    });

    await user.click(screen.getByRole('button', { name: 'Pagar' }));
    await user.selectOptions(screen.getByLabelText('Conta para débito:'), 'acc-001');
    await user.click(screen.getByRole('button', { name: 'Pagar' }));

    await waitFor(() => {
      expect(screen.getByText('Não foi possível pagar a despesa.')).toBeInTheDocument();
      expect(screen.getByTestId('expense-status-exp-001')).toHaveTextContent('Não paga');
    });
  });
});
