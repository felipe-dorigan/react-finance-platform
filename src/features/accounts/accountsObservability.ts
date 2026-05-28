import { emitErrorSignal } from '@/features/observability/errorSignalService';
import { emitTelemetryEvent } from '@/features/observability/telemetryService';
import { getMockSession } from '@/features/wallets/session/sessionService';

type AccountsObservabilityContext = {
  walletId: string;
  route: string;
};

function createCorrelationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `corr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resolveContext({ walletId, route }: AccountsObservabilityContext) {
  const session = getMockSession();

  return {
    walletId,
    route,
    sessionId: `${session.userId}:${session.walletId}`,
    correlationId: createCorrelationId(),
  };
}

export function trackAccountMutationSuccess(
  context: AccountsObservabilityContext,
  eventName: 'accounts.create.succeeded' | 'accounts.update.succeeded' | 'accounts.archive.succeeded' | 'accounts.reactivate.succeeded',
  payload?: Record<string, unknown>,
): void {
  emitTelemetryEvent({
    ...resolveContext(context),
    eventName,
    category: 'accounts',
    payload: payload ?? null,
  });
}

export function trackAccountDeleteBlocked(
  context: AccountsObservabilityContext,
  details?: Record<string, unknown>,
): void {
  const base = resolveContext(context);

  emitTelemetryEvent({
    ...base,
    eventName: 'accounts.delete.blocked',
    category: 'guard',
    payload: details ?? null,
  });

  emitErrorSignal({
    ...base,
    source: 'accounts.delete.blocked',
    message: 'Exclusao de conta bloqueada por vinculo ativo.',
    recoverable: true,
    details: details ?? null,
  });
}

export function trackAccountsLoadFailure(
  context: AccountsObservabilityContext,
  error: unknown,
): void {
  emitErrorSignal({
    ...resolveContext(context),
    source: 'accounts.list.load',
    message: error instanceof Error ? error.message : 'Falha ao carregar contas.',
    recoverable: true,
    details: null,
  });
}
