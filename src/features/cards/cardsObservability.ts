import { emitErrorSignal } from '@/features/observability/errorSignalService';
import { emitTelemetryEvent } from '@/features/observability/telemetryService';
import { getMockSession } from '@/features/wallets/session/sessionService';

type CardsObservabilityContext = {
  walletId: string;
  route: string;
};

function createCorrelationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `corr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resolveContext({ walletId, route }: CardsObservabilityContext) {
  const session = getMockSession();

  return {
    walletId,
    route,
    sessionId: `${session.userId}:${session.walletId}`,
    correlationId: createCorrelationId(),
  };
}

export function trackCardMutationSuccess(
  context: CardsObservabilityContext,
  eventName:
    | 'cards.create.succeeded'
    | 'cards.update.succeeded'
    | 'cards.archive.succeeded'
    | 'cards.reactivate.succeeded'
    | 'cards.debit-account.changed',
  payload?: Record<string, unknown>,
): void {
  emitTelemetryEvent({
    ...resolveContext(context),
    eventName,
    category: 'cards',
    payload: payload ?? null,
  });
}

export function trackCardsLoadFailure(context: CardsObservabilityContext, error: unknown): void {
  emitErrorSignal({
    ...resolveContext(context),
    source: 'cards.list.load',
    message: error instanceof Error ? error.message : 'Falha ao carregar cartoes.',
    recoverable: true,
    details: null,
  });
}

export function trackCardMutationFailure(
  context: CardsObservabilityContext,
  source: string,
  error: unknown,
  details?: Record<string, unknown>,
): void {
  emitErrorSignal({
    ...resolveContext(context),
    source,
    message: error instanceof Error ? error.message : 'Falha em mutacao de cartao.',
    recoverable: true,
    details: details ?? null,
  });
}
