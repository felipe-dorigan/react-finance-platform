import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { WalletDashboardPage } from '@/features/transactions/pages/WalletDashboardPage';
import * as transactionService from '@/features/transactions/transactionService';

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

describe('transaction happy path', () => {
  it('cria uma transacao e mostra feedback visual com lista atualizada', async () => {
    const user = userEvent.setup();

    const createdTransaction = {
      id: 'tx-100',
      walletId: 'wallet-001',
      type: 'income' as const,
      status: 'effective' as const,
      amount: '250.00',
      date: '2026-05-28T00:00:00.000Z',
      period: 'monthly' as const,
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
      cardExpensePaymentStatus: null,
      paidFromAccountId: null,
      paidAt: null,
    };

    vi.spyOn(transactionService, 'listWalletTransactions')
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([createdTransaction]);

    vi.spyOn(transactionService, 'createWalletTransaction').mockResolvedValueOnce(createdTransaction);

    renderDashboard();

    await screen.findByLabelText('Tipo');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'income');
    await user.type(screen.getByLabelText('Valor'), '250.00');
    await user.type(screen.getByLabelText('Data'), '2026-05-28');
    await user.click(screen.getByRole('button', { name: 'Salvar transacao' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Transacao criada com sucesso.');
    await waitFor(() => {
      expect(screen.getByText('income')).toBeInTheDocument();
    });
  });
});
