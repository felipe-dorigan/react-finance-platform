import { emitErrorSignal } from '@/features/observability/errorSignalService';
import { emitTelemetryEvent } from '@/features/observability/telemetryService';
import { getMockSession } from '@/features/wallets/session/sessionService';

function createCorrelationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `corr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSessionContext(walletId: string, route: string) {
  const session = getMockSession();

  return {
    walletId,
    route,
    sessionId: `${session.userId}:${session.walletId}`,
    correlationId: createCorrelationId(),
  };
}

export function trackTransactionCreateSuccess(walletId: string, route: string) {
  const context = getSessionContext(walletId, route);

  emitTelemetryEvent({
    ...context,
    eventName: 'transaction.create.succeeded',
    category: 'transactions',
    payload: null,
  });
}

export function trackTransactionCreateFailure(walletId: string, route: string, error: unknown) {
  const context = getSessionContext(walletId, route);

  emitErrorSignal({
    ...context,
    source: 'transactions.create',
    message: error instanceof Error ? error.message : 'Falha ao criar transacao.',
    recoverable: true,
    details: null,
  });
}

export function trackTransactionLoadFailure(walletId: string, route: string, error: unknown) {
  const context = getSessionContext(walletId, route);

  emitErrorSignal({
    ...context,
    source: 'transactions.dashboard.load',
    message: error instanceof Error ? error.message : 'Falha ao carregar transacoes.',
    recoverable: true,
    details: null,
  });
}
