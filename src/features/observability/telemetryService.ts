import type { TelemetryEvent } from '@/features/shared/types/domain';

const telemetryEvents: TelemetryEvent[] = [];

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `telemetry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function emitTelemetryEvent(event: Omit<TelemetryEvent, 'id' | 'occurredAt'> & { occurredAt?: string }): TelemetryEvent {
  const payload: TelemetryEvent = {
    id: createId(),
    occurredAt: event.occurredAt ?? new Date().toISOString(),
    walletId: event.walletId ?? null,
    sessionId: event.sessionId,
    correlationId: event.correlationId,
    route: event.route,
    eventName: event.eventName,
    category: event.category,
    payload: event.payload ?? null,
  };

  telemetryEvents.push(payload);
  return payload;
}

export function listTelemetryEvents(walletId?: string): TelemetryEvent[] {
  const events = walletId ? telemetryEvents.filter((event) => event.walletId === walletId) : telemetryEvents;
  return structuredClone(events);
}

export function clearTelemetryEvents(): void {
  telemetryEvents.length = 0;
}