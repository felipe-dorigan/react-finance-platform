import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Card } from '@/features/shared/types/domain';
import { ExpenseList } from '@/features/expenses/components/ExpenseList';
import type { Expense } from '@/features/expenses/expenseService';

function renderExpenseList(props: Parameters<typeof ExpenseList>[0]) {
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

describe('expense list with card filter', () => {
  const mockWalletId = 'wallet-001';
  const mockAccounts = [
    { id: 'acc-001', name: 'Conta Corrente' },
    { id: 'acc-002', name: 'Conta Poupança' },
  ];

  const mockCards: Card[] = [
    {
      id: 'card-001',
      walletId: mockWalletId,
      name: 'Débito',
      debitAccountId: 'acc-001',
      status: 'active',
    },
    {
      id: 'card-002',
      walletId: mockWalletId,
      name: 'Crédito',
      debitAccountId: 'acc-002',
      status: 'active',
    },
    {
      id: 'card-003',
      walletId: mockWalletId,
      name: 'Virtual',
      debitAccountId: 'acc-001',
      status: 'active',
    },
  ];

  const mockExpenses: Expense[] = [
    {
      id: 'exp-001',
      walletId: mockWalletId,
      type: 'expense' as const,
      status: 'effective' as const,
      amount: '150.00',
      date: '2026-05-28T00:00:00.000Z',
      period: null,
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: 'card-001',
      cardExpensePaymentStatus: 'unpaid' as const,
      paidFromAccountId: null,
      paidAt: null,
    },
    {
      id: 'exp-002',
      walletId: mockWalletId,
      type: 'expense' as const,
      status: 'effective' as const,
      amount: '200.00',
      date: '2026-05-27T00:00:00.000Z',
      period: null,
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: 'card-002',
      cardExpensePaymentStatus: 'paid' as const,
      paidFromAccountId: 'acc-002',
      paidAt: '2026-05-27T00:00:00.000Z',
    },
    {
      id: 'exp-003',
      walletId: mockWalletId,
      type: 'expense' as const,
      status: 'effective' as const,
      amount: '75.00',
      date: '2026-05-26T00:00:00.000Z',
      period: null,
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: 'card-001',
      cardExpensePaymentStatus: 'unpaid' as const,
      paidFromAccountId: null,
      paidAt: null,
    },
  ];

  it('renderiza lista de despesas com status de pagamento', () => {
    renderExpenseList({
      expenses: mockExpenses,
      cards: mockCards,
      accounts: mockAccounts,
      walletId: mockWalletId,
    });

    expect(screen.getByText('Despesas')).toBeInTheDocument();
    expect(screen.getByText('R$ 150.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 200.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 75.00')).toBeInTheDocument();

    expect(screen.getByTestId('expense-status-exp-001')).toHaveTextContent('Não paga');
    expect(screen.getByTestId('expense-status-exp-002')).toHaveTextContent('Paga');
    expect(screen.getByTestId('expense-status-exp-003')).toHaveTextContent('Não paga');
  });

  it('filtra despesas por cartão selecionado', async () => {
    const user = userEvent.setup();

    renderExpenseList({
      expenses: mockExpenses,
      cards: mockCards,
      accounts: mockAccounts,
      walletId: mockWalletId,
    });

    const filterSelect = screen.getByLabelText('Filtrar por cartão:');

    // Filtrar por card-001 (Débito)
    await user.selectOptions(filterSelect, 'card-001');

    // Deve mostrar apenas as despesas do card-001
    expect(screen.getByText('R$ 150.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 75.00')).toBeInTheDocument();
    expect(screen.queryByText('R$ 200.00')).not.toBeInTheDocument();
  });

  it('exibe "Todas" para listar todas as despesas novamente', async () => {
    const user = userEvent.setup();

    renderExpenseList({
      expenses: mockExpenses,
      cards: mockCards,
      accounts: mockAccounts,
      walletId: mockWalletId,
    });

    const filterSelect = screen.getByLabelText('Filtrar por cartão:');

    // Filtrar por card-001
    await user.selectOptions(filterSelect, 'card-001');
    expect(screen.queryByText('R$ 200.00')).not.toBeInTheDocument();

    // Voltar para "Todas"
    await user.selectOptions(filterSelect, '');
    expect(screen.getByText('R$ 150.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 200.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 75.00')).toBeInTheDocument();
  });

  it('mostra mensagem quando não há despesas para o filtro', async () => {
    const user = userEvent.setup();

    renderExpenseList({
      expenses: mockExpenses,
      cards: mockCards,
      accounts: mockAccounts,
      walletId: mockWalletId,
    });

    const filterSelect = screen.getByLabelText('Filtrar por cartão:');

    // Filtrar por um cartão sem despesas associadas
    await user.selectOptions(filterSelect, 'card-003');

    expect(screen.getByText('Nenhuma despesa encontrada para o filtro selecionado.'))
      .toBeInTheDocument();
  });

  it('mostra botão "Pagar" apenas para despesas não pagas', () => {
    renderExpenseList({
      expenses: mockExpenses,
      cards: mockCards,
      accounts: mockAccounts,
      walletId: mockWalletId,
    });

    const payButtons = screen.getAllByRole('button', { name: 'Pagar' });

    // Deve haver 2 botões "Pagar" (para as despesas não pagas)
    expect(payButtons).toHaveLength(2);
  });

  it('expande formulário de pagamento ao clicar em "Pagar"', async () => {
    const user = userEvent.setup();

    renderExpenseList({
      expenses: mockExpenses,
      cards: mockCards,
      accounts: mockAccounts,
      walletId: mockWalletId,
    });

    const payButtons = screen.getAllByRole('button', { name: 'Pagar' });
    await user.click(payButtons[0]);

    // O formulário de pagamento deve ser expandido
    expect(screen.getByLabelText(/Formulário para pagar despesa/)).toBeInTheDocument();
  });

  it('renderiza lista vazia quando não há despesas', () => {
    renderExpenseList({
      expenses: [],
      cards: mockCards,
      accounts: mockAccounts,
      walletId: mockWalletId,
    });

    expect(screen.getByText('Nenhuma despesa cadastrada até o momento.'))
      .toBeInTheDocument();
  });
});
