import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { PayExpenseAction } from '@/features/expenses/components/PayExpenseAction';
import * as expenseService from '@/features/expenses/expenseService';

function renderPayExpenseAction(props: Parameters<typeof PayExpenseAction>[0]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <PayExpenseAction {...props} />
    </QueryClientProvider>,
  );
}

describe('pay card expense flow', () => {
  const mockWalletId = 'wallet-001';
  const mockExpenseId = 'exp-001';
  const mockExpenseAmount = '150.00';
  const mockAccounts = [
    { id: 'acc-001', name: 'Conta Corrente' },
    { id: 'acc-002', name: 'Conta Poupança' },
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

  it('renderiza formulário com campos obrigatórios', () => {
    renderPayExpenseAction({
      walletId: mockWalletId,
      expenseId: mockExpenseId,
      expenseAmount: mockExpenseAmount,
      accounts: mockAccounts,
    });

    expect(screen.getByText('Pagar despesa')).toBeInTheDocument();
    expect(screen.getByLabelText('Conta para débito:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pagar' })).toBeInTheDocument();
  });

  it('bloqueia envio sem seleção de conta', async () => {
    const user = userEvent.setup();

    renderPayExpenseAction({
      walletId: mockWalletId,
      expenseId: mockExpenseId,
      expenseAmount: mockExpenseAmount,
      accounts: mockAccounts,
    });

    const payButton = screen.getByRole('button', { name: 'Pagar' });
    expect(payButton).toBeDisabled();

    const accountSelect = screen.getByLabelText('Conta para débito:');
    await user.click(payButton);

    // O botão continua desabilitado porque não há conta selecionada
    expect(payButton).toBeDisabled();
  });

  it('habilita botão após seleção de conta', async () => {
    const user = userEvent.setup();

    renderPayExpenseAction({
      walletId: mockWalletId,
      expenseId: mockExpenseId,
      expenseAmount: mockExpenseAmount,
      accounts: mockAccounts,
    });

    const payButton = screen.getByRole('button', { name: 'Pagar' });
    expect(payButton).toBeDisabled();

    const accountSelect = screen.getByLabelText('Conta para débito:');
    await user.selectOptions(accountSelect, 'acc-001');

    expect(payButton).not.toBeDisabled();
  });

  it('exibe feedback de sucesso após pagamento', async () => {
    const user = userEvent.setup();

    vi.spyOn(expenseService, 'payCardExpense').mockResolvedValueOnce(paidExpense);

    renderPayExpenseAction({
      walletId: mockWalletId,
      expenseId: mockExpenseId,
      expenseAmount: mockExpenseAmount,
      accounts: mockAccounts,
    });

    const accountSelect = screen.getByLabelText('Conta para débito:');
    const payButton = screen.getByRole('button', { name: 'Pagar' });

    await user.selectOptions(accountSelect, 'acc-001');
    await user.click(payButton);

    await waitFor(() => {
      expect(screen.getByText('Despesa paga com sucesso.')).toBeInTheDocument();
    });
  });

  it('exibe feedback de erro em caso de falha', async () => {
    const user = userEvent.setup();

    vi.spyOn(expenseService, 'payCardExpense').mockRejectedValueOnce(
      new Error('API Error'),
    );

    const { unmount } = renderPayExpenseAction({
      walletId: mockWalletId,
      expenseId: mockExpenseId,
      expenseAmount: mockExpenseAmount,
      accounts: mockAccounts,
    });

    const accountSelect = screen.getByLabelText('Conta para débito:');
    const payButton = screen.getByRole('button', { name: 'Pagar' });

    await user.selectOptions(accountSelect, 'acc-001');
    await user.click(payButton);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível pagar a despesa.'))
        .toBeInTheDocument();
    });

    unmount();
  });

  it('desabilita campos durante processamento', async () => {
    const user = userEvent.setup();

    vi.spyOn(expenseService, 'payCardExpense').mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => resolve(paidExpense), 1000);
      }),
    );

    renderPayExpenseAction({
      walletId: mockWalletId,
      expenseId: mockExpenseId,
      expenseAmount: mockExpenseAmount,
      accounts: mockAccounts,
    });

    const accountSelect = screen.getByLabelText('Conta para débito:');
    const payButton = screen.getByRole('button', { name: 'Pagar' });

    await user.selectOptions(accountSelect, 'acc-001');
    await user.click(payButton);

    expect(screen.getByRole('button', { name: 'Processando...' })).toBeInTheDocument();
    expect(accountSelect).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('Despesa paga com sucesso.')).toBeInTheDocument();
    });
  });

  it('chama onSuccess após pagamento bem-sucedido', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    vi.spyOn(expenseService, 'payCardExpense').mockResolvedValueOnce(paidExpense);

    renderPayExpenseAction({
      walletId: mockWalletId,
      expenseId: mockExpenseId,
      expenseAmount: mockExpenseAmount,
      accounts: mockAccounts,
      onSuccess,
    });

    const accountSelect = screen.getByLabelText('Conta para débito:');
    const payButton = screen.getByRole('button', { name: 'Pagar' });

    await user.selectOptions(accountSelect, 'acc-001');
    await user.click(payButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('chama a função payCardExpense com os parâmetros corretos', async () => {
    const user = userEvent.setup();
    const payCardExpenseSpy = vi.spyOn(expenseService, 'payCardExpense')
      .mockResolvedValueOnce(paidExpense);

    renderPayExpenseAction({
      walletId: mockWalletId,
      expenseId: mockExpenseId,
      expenseAmount: mockExpenseAmount,
      accounts: mockAccounts,
    });

    const accountSelect = screen.getByLabelText('Conta para débito:');
    const payButton = screen.getByRole('button', { name: 'Pagar' });

    await user.selectOptions(accountSelect, 'acc-001');
    await user.click(payButton);

    await waitFor(() => {
      expect(payCardExpenseSpy).toHaveBeenCalledWith(
        mockWalletId,
        mockExpenseId,
        'acc-001',
      );
    });
  });

  it('limpa formulário após sucesso', async () => {
    const user = userEvent.setup();

    vi.spyOn(expenseService, 'payCardExpense').mockResolvedValueOnce(paidExpense);

    renderPayExpenseAction({
      walletId: mockWalletId,
      expenseId: mockExpenseId,
      expenseAmount: mockExpenseAmount,
      accounts: mockAccounts,
    });

    const accountSelect = screen.getByLabelText('Conta para débito:') as HTMLSelectElement;
    const payButton = screen.getByRole('button', { name: 'Pagar' });

    await user.selectOptions(accountSelect, 'acc-001');
    expect(accountSelect.value).toBe('acc-001');

    await user.click(payButton);

    await waitFor(() => {
      expect(screen.getByText('Despesa paga com sucesso.')).toBeInTheDocument();
      expect(accountSelect.value).toBe('');
    });
  });
});
