import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Transaction } from '@/features/shared/types/domain';
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

describe('wallet dashboard states', () => {
  it('renderiza estado de loading enquanto transacoes carregam', async () => {
    const pendingPromise = new Promise<Transaction[]>(() => undefined);
    vi.spyOn(transactionService, 'listWalletTransactions').mockReturnValueOnce(pendingPromise);

    renderDashboard();

    expect(await screen.findByText('Carregando dashboard financeiro...')).toBeInTheDocument();
  });

  it('renderiza estado vazio quando a carteira nao possui transacoes', async () => {
    vi.spyOn(transactionService, 'listWalletTransactions').mockResolvedValueOnce([]);

    renderDashboard();

    expect(await screen.findByText('Nenhuma transacao encontrada para esta carteira.')).toBeInTheDocument();
  });

  it('renderiza estado de erro quando o carregamento falha', async () => {
    vi.spyOn(transactionService, 'listWalletTransactions').mockRejectedValueOnce(new Error('boom'));

    renderDashboard();

    expect(await screen.findByRole('alert')).toHaveTextContent('Nao foi possivel carregar as transacoes da carteira.');
  });
});
