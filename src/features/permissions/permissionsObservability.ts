import { emitErrorSignal } from '@/features/observability/errorSignalService';
import { emitTelemetryEvent } from '@/features/observability/telemetryService';
import { getMockSession } from '@/features/wallets/session/sessionService';

type PermissionsObservabilityContext = {
  walletId: string;
  route: string;
};

function createCorrelationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `corr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resolveContext({ walletId, route }: PermissionsObservabilityContext) {
  const session = getMockSession();

  return {
    walletId,
    route,
    sessionId: `${session.userId}:${session.walletId}`,
    correlationId: createCorrelationId(),
  };
}

export function trackPermissionInviteSuccess(
  context: PermissionsObservabilityContext,
  payload?: Record<string, unknown>,
): void {
  emitTelemetryEvent({
    ...resolveContext(context),
    eventName: 'permissions.invite.succeeded',
    category: 'permissions',
    payload: payload ?? null,
  });
}

export function trackPermissionUpsertSuccess(
  context: PermissionsObservabilityContext,
  payload?: Record<string, unknown>,
): void {
  emitTelemetryEvent({
    ...resolveContext(context),
    eventName: 'permissions.upsert.succeeded',
    category: 'permissions',
    payload: payload ?? null,
  });
}

export function trackPermissionsLoadFailure(
  context: PermissionsObservabilityContext,
  error: unknown,
): void {
  emitErrorSignal({
    ...resolveContext(context),
    source: 'permissions.list.load',
    message: error instanceof Error ? error.message : 'Falha ao carregar colaboradores da carteira.',
    recoverable: true,
    details: null,
  });
}

export function trackPermissionMutationFailure(
  context: PermissionsObservabilityContext,
  source: string,
  error: unknown,
  details?: Record<string, unknown>,
): void {
  emitErrorSignal({
    ...resolveContext(context),
    source,
    message: error instanceof Error ? error.message : 'Falha em mutacao de permissao.',
    recoverable: true,
    details: details ?? null,
  });
}

export function trackPermissionVisualBlock(
  context: PermissionsObservabilityContext,
  payload?: Record<string, unknown>,
): void {
  const base = resolveContext(context);

  emitTelemetryEvent({
    ...base,
    eventName: 'permissions.visual-block.triggered',
    category: 'guard',
    payload: payload ?? null,
  });

  emitErrorSignal({
    ...base,
    source: 'permissions.visual-block',
    message: 'Acao bloqueada por papel sem permissao de gerenciamento.',
    recoverable: true,
    details: payload ?? null,
  });
}
