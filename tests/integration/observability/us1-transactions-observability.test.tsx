import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { listErrorSignals, clearErrorSignals } from '@/features/observability/errorSignalService';
import { clearTelemetryEvents, listTelemetryEvents } from '@/features/observability/telemetryService';
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

describe('us1 transactions observability', () => {
  afterEach(() => {
    clearTelemetryEvents();
    clearErrorSignals();
  });

  it('emite telemetria ao criar transacao com sucesso', async () => {
    const user = userEvent.setup();

    vi.spyOn(walletService, 'getWalletById').mockResolvedValue({
      id: 'wallet-001',
      ownerId: 'user-001',
      name: 'Carteira Principal',
      timezone: 'America/Sao_Paulo',
      status: 'active',
      mainBalance: '1000.00',
      projectedBalance: '1000.00',
    });

    vi.spyOn(transactionService, 'listWalletTransactions')
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    vi.spyOn(transactionService, 'createWalletTransaction').mockResolvedValueOnce({
      id: 'tx-401',
      walletId: 'wallet-001',
      type: 'income',
      status: 'effective',
      amount: '75.00',
      date: '2026-05-28T03:00:00.000Z',
      period: 'monthly',
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
      cardExpensePaymentStatus: null,
      paidFromAccountId: null,
      paidAt: null,
    });

    renderDashboard();

    await screen.findByLabelText('Tipo');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'income');
    await user.type(screen.getByLabelText('Valor'), '75.00');
    await user.type(screen.getByLabelText('Data'), '2026-05-28');
    await user.click(screen.getByRole('button', { name: 'Salvar transacao' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Transacao criada com sucesso.');
    });

    const telemetryEvents = listTelemetryEvents('wallet-001');
    expect(telemetryEvents.some((event) => event.eventName === 'transaction.create.succeeded')).toBe(true);
  });

  it('emite error signal quando o carregamento da dashboard falha e exibe erro visivel', async () => {
    vi.spyOn(walletService, 'getWalletById').mockResolvedValue({
      id: 'wallet-001',
      ownerId: 'user-001',
      name: 'Carteira Principal',
      timezone: 'America/Sao_Paulo',
      status: 'active',
      mainBalance: '1000.00',
      projectedBalance: '1000.00',
    });

    vi.spyOn(transactionService, 'listWalletTransactions').mockRejectedValueOnce(new Error('Falha de API'));

    renderDashboard();

    expect(await screen.findByRole('alert')).toHaveTextContent('Nao foi possivel carregar as transacoes da carteira.');

    const errorSignals = listErrorSignals('wallet-001');
    expect(errorSignals.some((signal) => signal.source === 'transactions.dashboard.load')).toBe(true);
  });
});
