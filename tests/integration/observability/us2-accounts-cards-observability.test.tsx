import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useState } from 'react';
import {
  __resetAccountService,
  createWalletAccount,
  deleteWalletAccount,
  listWalletAccounts,
} from '@/features/accounts/accountService';
import { __resetCardService, createWalletCard } from '@/features/cards/cardService';
import { clearErrorSignals, emitErrorSignal, listErrorSignals } from '@/features/observability/errorSignalService';
import {
  clearTelemetryEvents,
  emitTelemetryEvent,
  listTelemetryEvents,
} from '@/features/observability/telemetryService';

const WALLET_ID = 'wallet-001';
const ROUTE = '/wallets/wallet-001/accounts-cards';
const SESSION_ID = 'session-us2-1';
const CORRELATION_ID = 'corr-us2-1';

function AccountsCardsObservabilityHarness() {
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleCreateAccountAndCard() {
    const createdAccount = await createWalletAccount(WALLET_ID, {
      name: 'Conta observability',
      balance: '1000.00',
    });

    await createWalletCard(WALLET_ID, {
      name: 'Cartao observability',
      debitAccountId: createdAccount.id,
    });

    emitTelemetryEvent({
      walletId: WALLET_ID,
      sessionId: SESSION_ID,
      correlationId: CORRELATION_ID,
      route: ROUTE,
      eventName: 'accounts-cards.create.succeeded',
      category: 'mutation',
      payload: { accountId: createdAccount.id },
    });

    setFeedback('Conta e cartao criados com sucesso.');
  }

  async function handleDeleteBlockedAccount() {
    const accounts = await listWalletAccounts(WALLET_ID);
    const target = accounts[0];
    if (!target) {
      return;
    }

    try {
      await deleteWalletAccount(WALLET_ID, target.id);
      setFeedback('Conta excluida com sucesso.');
    } catch (error) {
      emitErrorSignal({
        walletId: WALLET_ID,
        sessionId: SESSION_ID,
        correlationId: CORRELATION_ID,
        route: ROUTE,
        source: 'accounts-cards.delete.blocked',
        message: error instanceof Error ? error.message : 'Falha ao excluir conta.',
        recoverable: true,
        details: { accountId: target.id },
      });

      emitTelemetryEvent({
        walletId: WALLET_ID,
        sessionId: SESSION_ID,
        correlationId: CORRELATION_ID,
        route: ROUTE,
        eventName: 'accounts-cards.delete.blocked',
        category: 'guard',
        payload: { accountId: target.id },
      });

      setFeedback('Bloqueio de exclusao detectado.');
    }
  }

  function handleSimulateLoadFailure() {
    emitErrorSignal({
      walletId: WALLET_ID,
      sessionId: SESSION_ID,
      correlationId: CORRELATION_ID,
      route: ROUTE,
      source: 'accounts-cards.list.load',
      message: 'Nao foi possivel carregar contas e cartoes.',
      recoverable: true,
      details: { stage: 'initial-load' },
    });

    setFeedback('Nao foi possivel carregar as contas e cartoes.');
  }

  return (
    <main>
      <button type="button" onClick={handleCreateAccountAndCard}>Criar conta e cartao</button>
      <button type="button" onClick={handleDeleteBlockedAccount}>Excluir conta vinculada</button>
      <button type="button" onClick={handleSimulateLoadFailure}>Simular falha de carregamento</button>
      {feedback ? <p role="alert">{feedback}</p> : null}
    </main>
  );
}

describe('us2 accounts-cards observability', () => {
  beforeEach(() => {
    __resetAccountService();
    __resetCardService();
  });

  afterEach(() => {
    clearTelemetryEvents();
    clearErrorSignals();
  });

  it('emite telemetria em mutacao critica de criacao de conta-cartao', async () => {
    const user = userEvent.setup();
    render(<AccountsCardsObservabilityHarness />);

    await user.click(screen.getByRole('button', { name: 'Criar conta e cartao' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Conta e cartao criados com sucesso.');

    const telemetry = listTelemetryEvents(WALLET_ID);
    expect(telemetry.some((event) => event.eventName === 'accounts-cards.create.succeeded')).toBe(true);
  });

  it('emite telemetria e error signal quando exclusao de conta vinculada e bloqueada', async () => {
    const user = userEvent.setup();
    render(<AccountsCardsObservabilityHarness />);

    await user.click(screen.getByRole('button', { name: 'Criar conta e cartao' }));
    await user.click(screen.getByRole('button', { name: 'Excluir conta vinculada' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Bloqueio de exclusao detectado.');

    const telemetry = listTelemetryEvents(WALLET_ID);
    const errors = listErrorSignals(WALLET_ID);

    expect(telemetry.some((event) => event.eventName === 'accounts-cards.delete.blocked')).toBe(true);
    expect(errors.some((signal) => signal.source === 'accounts-cards.delete.blocked')).toBe(true);
  });

  it('emite error signal quando o carregamento da listagem falha e exibe erro visivel', async () => {
    const user = userEvent.setup();
    render(<AccountsCardsObservabilityHarness />);

    await user.click(screen.getByRole('button', { name: 'Simular falha de carregamento' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Nao foi possivel carregar as contas e cartoes.');

    const errors = listErrorSignals(WALLET_ID);
    expect(errors.some((signal) => signal.source === 'accounts-cards.list.load')).toBe(true);
  });
});