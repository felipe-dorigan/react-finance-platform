import { beforeEach, describe, expect, it } from 'vitest';
import { clearAuditStore, listAuditEvents } from '@/features/audit/auditStore';
import { emitAccountMutationTrail } from '@/features/accounts/accountsAuditBridge';
import { emitPermissionMutationTrail } from '@/features/permissions/permissionsAuditBridge';

describe('audit event schema contract', () => {
  beforeEach(() => {
    clearAuditStore();
  });

  it('emite eventos com campos obrigatorios de auditoria e changedFields quando aplicavel', () => {
    emitAccountMutationTrail({
      account: {
        id: 'acc-1',
        walletId: 'wallet-001',
        name: 'Conta principal',
        status: 'inactive',
        balance: '1000.00',
      },
      action: 'account.archived',
      changedFields: [{ field: 'status', before: 'active', after: 'inactive' }],
    });

    emitPermissionMutationTrail({
      permission: {
        id: 'perm-1',
        walletId: 'wallet-001',
        invitedEmail: 'guest@finance.dev',
        role: 'edit',
        roleLabel: 'leitura+edicao',
      },
      action: 'permission.upserted',
      changedFields: [{ field: 'role', before: 'read', after: 'edit' }],
    });

    const events = listAuditEvents('wallet-001');
    expect(events).toHaveLength(2);

    for (const event of events) {
      expect(event.walletId).toBeTruthy();
      expect(event.actorUserId ?? event.actorEmail).toBeTruthy();
      expect(event.actorRole).toBeTruthy();
      expect(event.action).toBeTruthy();
      expect(event.entityType).toBeTruthy();
      expect(event.entityId).toBeTruthy();
      expect(event.occurredAt).toBeTruthy();
    }

    const statusEvent = events.find((event) => event.action === 'account.archived');
    const permissionEvent = events.find((event) => event.action === 'permission.upserted');

    expect(statusEvent?.changedFields).not.toBeNull();
    expect(statusEvent?.changedFields?.[0]).toMatchObject({ field: 'status', before: 'active', after: 'inactive' });

    expect(permissionEvent?.changedFields).not.toBeNull();
    expect(permissionEvent?.changedFields?.[0]).toMatchObject({ field: 'role', before: 'read', after: 'edit' });
  });
});
