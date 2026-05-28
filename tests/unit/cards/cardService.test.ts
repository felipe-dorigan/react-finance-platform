import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  __resetCardService,
  changeCardDebitAccount,
  createWalletCard,
  listWalletCards,
  updateWalletCard,
} from '@/features/cards/cardService';
import { clearErrorSignals, listErrorSignals } from '@/features/observability/errorSignalService';
import { clearTelemetryEvents, listTelemetryEvents } from '@/features/observability/telemetryService';

const WALLET_ID = 'wallet-001';
const ROUTE = '/wallets/wallet-001/cards';
const OBSERVABILITY = {
  sessionId: 'session-cards-t059',
  correlationId: 'corr-cards-t059',
  route: ROUTE,
};

describe('card service - debit account link latency', () => {
  beforeEach(() => {
    __resetCardService();
  });

  afterEach(() => {
    clearTelemetryEvents();
    clearErrorSignals();
  });

  it('emite telemetria de latencia ao criar cartao com vinculo de conta de debito', async () => {
    const createdCard = await createWalletCard(
      WALLET_ID,
      {
        name: 'Cartao Principal',
        debitAccountId: 'acc-001',
      },
      OBSERVABILITY,
    );

    expect(createdCard.debitAccountId).toBe('acc-001');

    const telemetry = listTelemetryEvents(WALLET_ID);
    const linkEvent = telemetry.find((event) => event.eventName === 'cards.debit-account.linked');

    expect(linkEvent).toBeDefined();
    expect(linkEvent?.category).toBe('latency');
    expect(linkEvent?.payload).toMatchObject({
      cardId: createdCard.id,
      debitAccountId: 'acc-001',
      latencyTargetMs: 1_000,
      requirementId: 'FR-030A-SC-009',
    });
    expect(typeof linkEvent?.payload?.latencyMs).toBe('number');
    expect(linkEvent?.payload?.latencyTargetMet).toBe(true);
  });

  it('troca conta de debito e registra latencia observavel para FR-030A-SC-009', async () => {
    const createdCard = await createWalletCard(
      WALLET_ID,
      {
        name: 'Cartao Viagem',
        debitAccountId: 'acc-001',
      },
      OBSERVABILITY,
    );

    clearTelemetryEvents();

    const updatedCard = await changeCardDebitAccount(
      WALLET_ID,
      createdCard.id,
      'acc-002',
      OBSERVABILITY,
    );

    expect(updatedCard.debitAccountId).toBe('acc-002');

    const cards = await listWalletCards(WALLET_ID);
    expect(cards[0]?.debitAccountId).toBe('acc-002');

    const telemetry = listTelemetryEvents(WALLET_ID);
    const changeEvent = telemetry.find((event) => event.eventName === 'cards.debit-account.changed');

    expect(changeEvent).toBeDefined();
    expect(changeEvent?.payload).toMatchObject({
      cardId: createdCard.id,
      debitAccountId: 'acc-002',
      latencyTargetMs: 1_000,
      requirementId: 'FR-030A-SC-009',
      latencyTargetMet: true,
    });
  });

  it('mantem compatibilidade de updateWalletCard e instrumenta troca quando debitAccountId e informado', async () => {
    const createdCard = await createWalletCard(
      WALLET_ID,
      {
        name: 'Cartao Antigo',
        debitAccountId: 'acc-001',
      },
      OBSERVABILITY,
    );

    clearTelemetryEvents();

    const updatedCard = await updateWalletCard(
      WALLET_ID,
      createdCard.id,
      {
        name: 'Cartao Novo',
        debitAccountId: 'acc-003',
      },
      OBSERVABILITY,
    );

    expect(updatedCard.name).toBe('Cartao Novo');
    expect(updatedCard.debitAccountId).toBe('acc-003');

    const telemetry = listTelemetryEvents(WALLET_ID);
    expect(telemetry.some((event) => event.eventName === 'cards.debit-account.changed')).toBe(true);
  });

  it('emite error signal quando falha a troca de conta de debito', async () => {
    await expect(
      changeCardDebitAccount(WALLET_ID, 'card-inexistente', 'acc-999', OBSERVABILITY),
    ).rejects.toThrow('Cartao nao encontrado para troca da conta de debito.');

    const errors = listErrorSignals(WALLET_ID);
    const signal = errors.find((item) => item.source === 'cards.debit-account.failed');

    expect(signal).toBeDefined();
    expect(signal?.details).toMatchObject({
      cardId: 'card-inexistente',
      debitAccountId: 'acc-999',
      latencyTargetMs: 1_000,
      requirementId: 'FR-030A-SC-009',
    });
  });
});
