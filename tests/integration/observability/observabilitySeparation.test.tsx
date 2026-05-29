import { beforeEach, describe, expect, it } from 'vitest';
import { appendAuditEvent, clearAuditStore, listAuditEvents } from '@/features/audit/auditStore';
import {
  clearTelemetryEvents,
  emitTelemetryEvent,
  listTelemetryEvents,
} from '@/features/observability/telemetryService';
import { clearErrorSignals, emitErrorSignal, listErrorSignals } from '@/features/observability/errorSignalService';

describe('observability separation from audit', () => {
  beforeEach(() => {
    clearAuditStore();
    clearTelemetryEvents();
    clearErrorSignals();
  });

  it('mantem stores independentes entre auditoria, telemetria e sinais de erro', () => {
    appendAuditEvent({
      id: 'audit-1',
      walletId: 'wallet-001',
      actorUserId: 'user-001',
      actorEmail: 'owner@finance.dev',
      actorRole: 'owner',
      action: 'transaction.created',
      entityType: 'transaction',
      entityId: 'tx-1',
      changedFields: null,
      metadata: { source: 'integration-test' },
      occurredAt: '2026-05-29T12:00:00.000Z',
    });

    emitTelemetryEvent({
      walletId: 'wallet-001',
      sessionId: 'session-1',
      correlationId: 'corr-1',
      route: '/wallets/wallet-001/dashboard',
      eventName: 'dashboard.loaded',
      category: 'ui',
      payload: { source: 'integration-test' },
    });

    emitErrorSignal({
      walletId: 'wallet-001',
      sessionId: 'session-1',
      correlationId: 'corr-1',
      route: '/wallets/wallet-001/dashboard',
      source: 'dashboard.load',
      message: 'Falha simulada de carregamento',
      recoverable: true,
      details: { source: 'integration-test' },
    });

    const auditEvents = listAuditEvents('wallet-001');
    const telemetryEvents = listTelemetryEvents('wallet-001');
    const errorSignals = listErrorSignals('wallet-001');

    expect(auditEvents).toHaveLength(1);
    expect(telemetryEvents).toHaveLength(1);
    expect(errorSignals).toHaveLength(1);

    expect(auditEvents[0].action).toBe('transaction.created');
    expect(telemetryEvents[0].eventName).toBe('dashboard.loaded');
    expect(errorSignals[0].source).toBe('dashboard.load');

    expect(auditEvents[0]).not.toHaveProperty('eventName');
    expect(telemetryEvents[0]).not.toHaveProperty('entityType');
    expect(errorSignals[0]).not.toHaveProperty('entityType');
  });
});
