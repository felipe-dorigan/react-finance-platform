import type { Card } from '@/features/shared/types/domain';
import { emitErrorSignal } from '@/features/observability/errorSignalService';
import { emitTelemetryEvent } from '@/features/observability/telemetryService';

export type CreateCardInput = {
  name: string;
  debitAccountId: string;
};

export type UpdateCardInput = {
  name?: string;
  debitAccountId?: string;
};

export type CardObservabilityContext = {
  sessionId?: string;
  correlationId?: string;
  route?: string;
};

const CARD_ROUTE_TEMPLATE = '/wallets/:walletId/cards';
const CARD_SERVICE_SOURCE = 'cards.debit-account';
const CARD_SLA_TARGET_MS = 1_000;

function nowInMs(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

function resolveObservabilityContext(context?: CardObservabilityContext): Required<CardObservabilityContext> {
  return {
    sessionId: context?.sessionId ?? 'session-card-service',
    correlationId:
      context?.correlationId ??
      (globalThis.crypto?.randomUUID?.() ?? `corr-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    route: context?.route ?? CARD_ROUTE_TEMPLATE,
  };
}

async function withLatencyTelemetry<T>(
  params: {
    walletId: string;
    cardId: string;
    eventName: string;
    debitAccountId: string;
    context?: CardObservabilityContext;
  },
  operation: () => Promise<T>,
): Promise<T> {
  const startedAt = nowInMs();
  const observability = resolveObservabilityContext(params.context);

  try {
    const result = await operation();
    const latencyMs = nowInMs() - startedAt;

    emitTelemetryEvent({
      walletId: params.walletId,
      sessionId: observability.sessionId,
      correlationId: observability.correlationId,
      route: observability.route,
      eventName: params.eventName,
      category: 'latency',
      payload: {
        cardId: params.cardId,
        debitAccountId: params.debitAccountId,
        latencyMs,
        latencyTargetMs: CARD_SLA_TARGET_MS,
        latencyTargetMet: latencyMs < CARD_SLA_TARGET_MS,
        requirementId: 'FR-030A-SC-009',
      },
    });

    return result;
  } catch (error) {
    const latencyMs = nowInMs() - startedAt;

    emitErrorSignal({
      walletId: params.walletId,
      sessionId: observability.sessionId,
      correlationId: observability.correlationId,
      route: observability.route,
      source: `${CARD_SERVICE_SOURCE}.failed`,
      message: error instanceof Error ? error.message : 'Falha ao vincular conta de debito do cartao.',
      recoverable: true,
      details: {
        cardId: params.cardId,
        debitAccountId: params.debitAccountId,
        latencyMs,
        latencyTargetMs: CARD_SLA_TARGET_MS,
        requirementId: 'FR-030A-SC-009',
      },
    });

    throw error;
  }
}

function findCardIndex(walletId: string, cardId: string): number {
  return cardStore.findIndex((card) => card.id === cardId && card.walletId === walletId);
}

let cardSequence = 0;
let cardStore: Card[] = [];

export function __resetCardService(): void {
  cardSequence = 0;
  cardStore = [];
}

export function __setCardsForTests(cards: Card[]): void {
  cardStore = [...cards];
  cardSequence = cards.length;
}

export async function listWalletCards(walletId: string): Promise<Card[]> {
  return cardStore.filter((card) => card.walletId === walletId);
}

export async function createWalletCard(
  walletId: string,
  input: CreateCardInput,
  observability?: CardObservabilityContext,
): Promise<Card> {
  cardSequence += 1;
  const nextCardId = `card-${cardSequence}`;

  return withLatencyTelemetry(
    {
      walletId,
      cardId: nextCardId,
      debitAccountId: input.debitAccountId,
      eventName: 'cards.debit-account.linked',
      context: observability,
    },
    async () => {
      const createdCard: Card = {
        id: nextCardId,
        walletId,
        name: input.name,
        debitAccountId: input.debitAccountId,
        status: 'active',
      };

      cardStore = [...cardStore, createdCard];
      return createdCard;
    },
  );
}

export async function changeCardDebitAccount(
  walletId: string,
  cardId: string,
  debitAccountId: string,
  observability?: CardObservabilityContext,
): Promise<Card> {
  return withLatencyTelemetry(
    {
      walletId,
      cardId,
      debitAccountId,
      eventName: 'cards.debit-account.changed',
      context: observability,
    },
    async () => {
      const index = findCardIndex(walletId, cardId);

      if (index === -1) {
        throw new Error('Cartao nao encontrado para troca da conta de debito.');
      }

      const updatedCard: Card = {
        ...cardStore[index],
        debitAccountId,
      };

      cardStore = [...cardStore.slice(0, index), updatedCard, ...cardStore.slice(index + 1)];
      return updatedCard;
    },
  );
}

export async function updateWalletCard(
  walletId: string,
  cardId: string,
  input: UpdateCardInput,
  observability?: CardObservabilityContext,
): Promise<Card> {
  const index = findCardIndex(walletId, cardId);

  if (index === -1) {
    throw new Error('Cartao nao encontrado para atualizacao.');
  }

  if (input.debitAccountId !== undefined) {
    const debitAccountChangedCard = await changeCardDebitAccount(
      walletId,
      cardId,
      input.debitAccountId,
      observability,
    );

    if (input.name === undefined) {
      return debitAccountChangedCard;
    }
  }

  const updatedCard: Card = {
    ...cardStore[index],
    ...(input.name !== undefined ? { name: input.name } : {}),
  };

  cardStore = [...cardStore.slice(0, index), updatedCard, ...cardStore.slice(index + 1)];
  return updatedCard;
}

export async function archiveWalletCard(walletId: string, cardId: string): Promise<Card> {
  const index = findCardIndex(walletId, cardId);

  if (index === -1) {
    throw new Error('Cartao nao encontrado para arquivamento.');
  }

  const archivedCard: Card = {
    ...cardStore[index],
    status: 'inactive',
  };

  cardStore = [...cardStore.slice(0, index), archivedCard, ...cardStore.slice(index + 1)];
  return archivedCard;
}

export async function reactivateWalletCard(walletId: string, cardId: string): Promise<Card> {
  const index = findCardIndex(walletId, cardId);

  if (index === -1) {
    throw new Error('Cartao nao encontrado para reativacao.');
  }

  const reactivatedCard: Card = {
    ...cardStore[index],
    status: 'active',
  };

  cardStore = [...cardStore.slice(0, index), reactivatedCard, ...cardStore.slice(index + 1)];
  return reactivatedCard;
}

export async function deleteWalletCard(walletId: string, cardId: string): Promise<void> {
  const index = findCardIndex(walletId, cardId);

  if (index === -1) {
    throw new Error('Cartao nao encontrado para exclusao.');
  }

  cardStore = [...cardStore.slice(0, index), ...cardStore.slice(index + 1)];
}
