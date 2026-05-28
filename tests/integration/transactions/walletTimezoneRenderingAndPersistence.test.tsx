import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Wallet } from '@/features/shared/types/domain';
import { WalletDashboardPage } from '@/features/transactions/pages/WalletDashboardPage';
import type { CreateTransactionInput } from '@/features/transactions/transactionService';
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

describe('wallet timezone rendering and persistence', () => {
  it('serializa a data local da carteira em UTC antes de persistir a transacao', async () => {
    const user = userEvent.setup();

    const wallet: Wallet = {
      id: 'wallet-001',
      ownerId: 'user-001',
      name: 'Carteira Principal',
      timezone: 'America/Sao_Paulo',
      status: 'active',
      mainBalance: '1000.00',
      projectedBalance: '1000.00',
    };

    const createSpy = vi.spyOn(transactionService, 'createWalletTransaction').mockResolvedValueOnce({
      id: 'tx-301',
      walletId: 'wallet-001',
      type: 'income',
      status: 'effective',
      amount: '90.00',
      date: '2026-05-28T03:00:00.000Z',
      period: 'monthly',
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
      cardExpensePaymentStatus: null,
      paidFromAccountId: null,
      paidAt: null,
    });

    vi.spyOn(walletService, 'getWalletById').mockResolvedValue(wallet);
    vi.spyOn(transactionService, 'listWalletTransactions')
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    renderDashboard();

    await screen.findByLabelText('Tipo');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'income');
    await user.type(screen.getByLabelText('Valor'), '90.00');
    await user.type(screen.getByLabelText('Data'), '2026-05-28');
    await user.click(screen.getByRole('button', { name: 'Salvar transacao' }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalled();
    });

    const payload = createSpy.mock.calls[0]?.[1] as CreateTransactionInput;
    expect(payload.date).toBe('2026-05-28T03:00:00.000Z');
  });
});
