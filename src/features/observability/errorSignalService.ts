import type { ErrorSignal } from '@/features/shared/types/domain';

const errorSignals: ErrorSignal[] = [];

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `error-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function emitErrorSignal(signal: Omit<ErrorSignal, 'id' | 'occurredAt'> & { occurredAt?: string }): ErrorSignal {
  const payload: ErrorSignal = {
    id: createId(),
    occurredAt: signal.occurredAt ?? new Date().toISOString(),
    walletId: signal.walletId ?? null,
    sessionId: signal.sessionId,
    correlationId: signal.correlationId,
    route: signal.route,
    source: signal.source,
    message: signal.message,
    recoverable: signal.recoverable,
    details: signal.details ?? null,
  };

  errorSignals.push(payload);
  return payload;
}

export function listErrorSignals(walletId?: string): ErrorSignal[] {
  const signals = walletId ? errorSignals.filter((signal) => signal.walletId === walletId) : errorSignals;
  return structuredClone(signals);
}

export function clearErrorSignals(): void {
  errorSignals.length = 0;
}