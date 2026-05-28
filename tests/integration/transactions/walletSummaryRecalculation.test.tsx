import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Transaction, Wallet } from '@/features/shared/types/domain';
import { WalletDashboardPage } from '@/features/transactions/pages/WalletDashboardPage';
import * as transactionService from '@/features/transactions/transactionService';
import * as walletService from '@/features/wallets/walletService';

function renderDashboard(path = '/wallets/wallet-001/dashboard') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/wallets/:walletId/dashboard" element={<WalletDashboardPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('wallet summary recalculation', () => {
  it('exibe mainBalance=1150 e projectedBalance=1100 com entrada effective 150 + saida pending 50 partindo de 1000', async () => {
    const mockWallet: Wallet = {
      id: 'wallet-001',
      ownerId: 'user-001',
      name: 'Carteira Principal',
      timezone: 'America/Sao_Paulo',
      status: 'active',
      mainBalance: '1000.00',
      projectedBalance: '1000.00',
    };

    const incomeTransaction: Transaction = {
      id: 'tx-001',
      walletId: 'wallet-001',
      type: 'income',
      status: 'effective',
      amount: '150.00',
      date: '2026-05-28T00:00:00.000Z',
      period: null,
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
      cardExpensePaymentStatus: null,
      paidFromAccountId: null,
      paidAt: null,
    };

    const expenseTransaction: Transaction = {
      id: 'tx-002',
      walletId: 'wallet-001',
      type: 'expense',
      status: 'pending',
      amount: '50.00',
      date: '2026-05-28T00:00:00.000Z',
      period: null,
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
      cardExpensePaymentStatus: null,
      paidFromAccountId: null,
      paidAt: null,
    };

    vi.spyOn(walletService, 'getWalletById').mockResolvedValueOnce(mockWallet);
    vi.spyOn(transactionService, 'listWalletTransactions')
      .mockResolvedValueOnce([incomeTransaction, expenseTransaction])
      .mockResolvedValueOnce([incomeTransaction, expenseTransaction]);

    renderDashboard();

    // Aguarda o componente de resumo aparecer
    const summarySection = await screen.findByLabelText('Resumo da carteira');
    expect(summarySection).toBeInTheDocument();

    // Valida mainBalance = 1000 + 150 = 1150
    expect(summarySection).toHaveTextContent('Saldo principal: R$ 1150.00');

    // Valida projectedBalance = 1000 + 150 - 50 = 1100
    expect(summarySection).toHaveTextContent('Saldo projetado: R$ 1100.00');
  });

  it('recalcula mainBalance e projectedBalance apos criar terceira transacao entrada effective 200', async () => {
    const user = userEvent.setup();

    const mockWallet: Wallet = {
      id: 'wallet-001',
      ownerId: 'user-001',
      name: 'Carteira Principal',
      timezone: 'America/Sao_Paulo',
      status: 'active',
      mainBalance: '1000.00',
      projectedBalance: '1000.00',
    };

    const firstIncomeTransaction: Transaction = {
      id: 'tx-001',
      walletId: 'wallet-001',
      type: 'income',
      status: 'effective',
      amount: '150.00',
      date: '2026-05-28T00:00:00.000Z',
      period: null,
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
      cardExpensePaymentStatus: null,
      paidFromAccountId: null,
      paidAt: null,
    };

    const expenseTransaction: Transaction = {
      id: 'tx-002',
      walletId: 'wallet-001',
      type: 'expense',
      status: 'pending',
      amount: '50.00',
      date: '2026-05-28T00:00:00.000Z',
      period: null,
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
      cardExpensePaymentStatus: null,
      paidFromAccountId: null,
      paidAt: null,
    };

    const secondIncomeTransaction: Transaction = {
      id: 'tx-003',
      walletId: 'wallet-001',
      type: 'income',
      status: 'effective',
      amount: '200.00',
      date: '2026-05-28T00:00:00.000Z',
      period: null,
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
      cardExpensePaymentStatus: null,
      paidFromAccountId: null,
      paidAt: null,
    };

    vi.spyOn(walletService, 'getWalletById').mockResolvedValueOnce(mockWallet);
    vi.spyOn(transactionService, 'listWalletTransactions')
      .mockResolvedValueOnce([firstIncomeTransaction, expenseTransaction])
      .mockResolvedValueOnce([
        firstIncomeTransaction,
        expenseTransaction,
        secondIncomeTransaction,
      ]);

    vi.spyOn(transactionService, 'createWalletTransaction').mockResolvedValueOnce(
      secondIncomeTransaction,
    );

    renderDashboard();

    // Aguarda o componente de resumo aparecer com 2 transacoes
    let summarySection = await screen.findByLabelText('Resumo da carteira');
    expect(summarySection).toHaveTextContent('Saldo principal: R$ 1150.00');
    expect(summarySection).toHaveTextContent('Saldo projetado: R$ 1100.00');

    // Preenche e submete o formulario
    await screen.findByLabelText('Tipo');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'income');
    await user.type(screen.getByLabelText('Valor'), '200.00');
    await user.type(screen.getByLabelText('Data'), '2026-05-28');
    await user.click(screen.getByRole('button', { name: 'Salvar transacao' }));

    // Aguarda o feedback de sucesso
    expect(await screen.findByRole('status')).toHaveTextContent('Transacao criada com sucesso.');

    // Aguarda o recalculation do resumo
    await waitFor(() => {
      summarySection = screen.getByLabelText('Resumo da carteira');
      // mainBalance = 1000 + 150 + 200 = 1350
      expect(summarySection).toHaveTextContent('Saldo principal: R$ 1350.00');
      // projectedBalance = 1000 + 150 - 50 + 200 = 1300
      expect(summarySection).toHaveTextContent('Saldo projetado: R$ 1300.00');
    });
  });

  it('renderiza lista com todas as 3 transacoes com tipos e valores corretos', async () => {
    const user = userEvent.setup();

    const mockWallet: Wallet = {
      id: 'wallet-001',
      ownerId: 'user-001',
      name: 'Carteira Principal',
      timezone: 'America/Sao_Paulo',
      status: 'active',
      mainBalance: '1000.00',
      projectedBalance: '1000.00',
    };

    const firstIncomeTransaction: Transaction = {
      id: 'tx-001',
      walletId: 'wallet-001',
      type: 'income',
      status: 'effective',
      amount: '150.00',
      date: '2026-05-28T00:00:00.000Z',
      period: null,
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
      cardExpensePaymentStatus: null,
      paidFromAccountId: null,
      paidAt: null,
    };

    const expenseTransaction: Transaction = {
      id: 'tx-002',
      walletId: 'wallet-001',
      type: 'expense',
      status: 'pending',
      amount: '50.00',
      date: '2026-05-28T00:00:00.000Z',
      period: null,
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
      cardExpensePaymentStatus: null,
      paidFromAccountId: null,
      paidAt: null,
    };

    const secondIncomeTransaction: Transaction = {
      id: 'tx-003',
      walletId: 'wallet-001',
      type: 'income',
      status: 'effective',
      amount: '200.00',
      date: '2026-05-28T00:00:00.000Z',
      period: null,
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
      cardExpensePaymentStatus: null,
      paidFromAccountId: null,
      paidAt: null,
    };

    vi.spyOn(walletService, 'getWalletById').mockResolvedValueOnce(mockWallet);
    vi.spyOn(transactionService, 'listWalletTransactions')
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        firstIncomeTransaction,
        expenseTransaction,
        secondIncomeTransaction,
      ]);

    vi.spyOn(transactionService, 'createWalletTransaction').mockResolvedValueOnce(
      secondIncomeTransaction,
    );

    renderDashboard();

    // Aguarda o formulario e cria todas as 3 transacoes
    await screen.findByLabelText('Tipo');

    // Primeira transacao
    await user.selectOptions(screen.getByLabelText('Tipo'), 'income');
    await user.type(screen.getByLabelText('Valor'), '150.00');
    await user.type(screen.getByLabelText('Data'), '2026-05-28');
    await user.click(screen.getByRole('button', { name: 'Salvar transacao' }));

    // Aguarda o feedback e a lista ser renderizada
    await screen.findByRole('status');

    await waitFor(() => {
      expect(screen.getByLabelText('Lista de transacoes')).toBeInTheDocument();
    });

    // Valida que a lista exibe todas as 3 transacoes com tipos e valores corretos
    const transactionList = screen.getByLabelText('Lista de transacoes');
    expect(transactionList).toHaveTextContent('income');
    expect(transactionList).toHaveTextContent('expense');
    expect(transactionList).toHaveTextContent('150.00');
    expect(transactionList).toHaveTextContent('50.00');
    expect(transactionList).toHaveTextContent('200.00');

    // Valida que existem 3 items na lista
    const listItems = transactionList.querySelectorAll('li');
    expect(listItems).toHaveLength(3);

    // Valida o conteudo de cada item
    expect(listItems[0]).toHaveTextContent('income');
    expect(listItems[0]).toHaveTextContent('effective');
    expect(listItems[0]).toHaveTextContent('150.00');

    expect(listItems[1]).toHaveTextContent('expense');
    expect(listItems[1]).toHaveTextContent('pending');
    expect(listItems[1]).toHaveTextContent('50.00');

    expect(listItems[2]).toHaveTextContent('income');
    expect(listItems[2]).toHaveTextContent('effective');
    expect(listItems[2]).toHaveTextContent('200.00');
  });
});
