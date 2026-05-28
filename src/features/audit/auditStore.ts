import type { AuditEvent } from '@/features/shared/types/domain';

const auditEvents: AuditEvent[] = [];

export function appendAuditEvent(event: AuditEvent): AuditEvent {
  auditEvents.push(structuredClone(event));
  return event;
}

export function listAuditEvents(walletId?: string): AuditEvent[] {
  const events = walletId ? auditEvents.filter((event) => event.walletId === walletId) : auditEvents;
  return structuredClone(events);
}

export function clearAuditStore(): void {
  auditEvents.length = 0;
}