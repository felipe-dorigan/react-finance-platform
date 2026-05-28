import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { WalletDashboardPage } from '@/features/transactions/pages/WalletDashboardPage';
import {
  DuplicateConfirmationRequiredError,
  type CreateTransactionInput,
} from '@/features/transactions/transactionService';
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

describe('duplicate confirmation flow', () => {
  it('exige confirmacao explicita apos 409 antes de persistir transacao', async () => {
    const user = userEvent.setup();

    const createdTransaction = {
      id: 'tx-201',
      walletId: 'wallet-001',
      type: 'expense' as const,
      status: 'effective' as const,
      amount: '120.00',
      date: '2026-05-28T00:00:00.000Z',
      period: 'monthly' as const,
      sourceAccountId: 'account-001',
      destinationAccountId: null,
      cardId: null,
      cardExpensePaymentStatus: null,
      paidFromAccountId: null,
      paidAt: null,
    };

    vi.spyOn(transactionService, 'listWalletTransactions')
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([createdTransaction]);

    const createSpy = vi
      .spyOn(transactionService, 'createWalletTransaction')
      .mockRejectedValueOnce(
        new DuplicateConfirmationRequiredError('Possivel duplicidade detectada; confirme para persistir.', {
          fingerprint: '120.00|2026-05-28T00:00:00.000Z|expense|account-001',
          walletId: 'wallet-001',
          transactionType: 'expense',
          amount: '120.00',
          date: '2026-05-28T00:00:00.000Z',
          primaryLinkType: 'account',
          primaryLinkId: 'account-001',
          matchedTransactionId: 'tx-050',
          detectedAt: '2026-05-28T00:01:00.000Z',
        }),
      )
      .mockResolvedValueOnce(createdTransaction);

    renderDashboard();

    await screen.findByLabelText('Tipo');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'expense');
    await user.type(screen.getByLabelText('Valor'), '120.00');
    await user.type(screen.getByLabelText('Data'), '2026-05-28');
    await user.click(screen.getByRole('button', { name: 'Salvar transacao' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Possivel duplicidade detectada; confirme para persistir.');
    expect(screen.getByText('Transacao semelhante encontrada: tx-050')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Confirmar e salvar mesmo assim' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Transacao criada com sucesso.');
    });

    const expectedPayload: CreateTransactionInput = {
      type: 'expense',
      status: 'effective',
      amount: '120',
      date: '2026-05-28T00:00:00.000Z',
      period: 'monthly',
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
    };

    expect(createSpy).toHaveBeenNthCalledWith(1, 'wallet-001', expectedPayload, undefined);
    expect(createSpy).toHaveBeenNthCalledWith(2, 'wallet-001', expectedPayload, { duplicateConfirmation: true });
  });
});
