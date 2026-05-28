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

describe('us1 transactions a11y', () => {
  it('prende o foco no dialogo de confirmacao e retorna ao gatilho original ao cancelar', async () => {
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

    vi.spyOn(transactionService, 'listWalletTransactions').mockResolvedValue([]);

    const expectedPayload: CreateTransactionInput = {
      type: 'expense',
      status: 'effective',
      amount: '120',
      date: '2026-05-28T03:00:00.000Z',
      period: 'monthly',
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
    };

    vi.spyOn(transactionService, 'createWalletTransaction').mockRejectedValueOnce(
      new DuplicateConfirmationRequiredError('Possivel duplicidade detectada; confirme para persistir.', {
        fingerprint: 'fp-001',
        walletId: 'wallet-001',
        transactionType: 'expense',
        amount: '120.00',
        date: '2026-05-28T03:00:00.000Z',
        primaryLinkType: 'account',
        primaryLinkId: 'account-001',
        matchedTransactionId: 'tx-050',
        detectedAt: '2026-05-28T03:01:00.000Z',
      }),
    );

    renderDashboard();

    await screen.findByLabelText('Tipo');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'expense');
    await user.type(screen.getByLabelText('Valor'), '120.00');
    await user.type(screen.getByLabelText('Data'), '2026-05-28');

    const submitButton = screen.getByRole('button', { name: 'Salvar transacao' });
    submitButton.focus();
    await user.click(submitButton);

    const dialog = await screen.findByRole('dialog', { name: 'Confirmar transacao duplicada' });
    expect(dialog).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Confirmar e salvar mesmo assim' });
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });

    await waitFor(() => {
      expect(confirmButton).toHaveFocus();
    });

    await user.tab();
    expect(cancelButton).toHaveFocus();

    await user.tab();
    expect(confirmButton).toHaveFocus();

    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Confirmar transacao duplicada' })).not.toBeInTheDocument();
      expect(submitButton).toHaveFocus();
    });

    expect(transactionService.createWalletTransaction).toHaveBeenCalledWith('wallet-001', expectedPayload, undefined);
  });
});
