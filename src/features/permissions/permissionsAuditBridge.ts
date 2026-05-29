import { appendAuditEvent } from '@/features/audit/auditStore';
import { appendWalletMutation } from '@/features/persistence/walletMutationJournal';
import type { WalletPermission } from '@/features/shared/types/domain';
import { getMockSession } from '@/features/wallets/session/sessionService';

type PermissionAuditAction = 'invite.created' | 'permission.upserted';

type PermissionAuditActor = {
  userId: string | null;
  email: string | null;
  role: 'owner' | 'read' | 'edit' | 'operate';
};

function createId(prefix: string): string {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resolveActor(actor?: PermissionAuditActor): PermissionAuditActor {
  if (actor) {
    return actor;
  }

  const session = getMockSession();
  return {
    userId: session.userId,
    email: session.email,
    role: session.role,
  };
}

export function emitPermissionMutationTrail(params: {
  permission: WalletPermission;
  action: PermissionAuditAction;
  changedFields?: Array<{ field: string; before: unknown; after: unknown }>;
  metadata?: Record<string, unknown>;
  actor?: PermissionAuditActor;
}): void {
  const actor = resolveActor(params.actor);
  const occurredAt = new Date().toISOString();
  const entityType = params.action === 'invite.created' ? 'invite' : 'permission';

  appendAuditEvent({
    id: createId('audit'),
    walletId: params.permission.walletId,
    actorUserId: actor.userId,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: params.action,
    entityType,
    entityId: params.permission.id,
    changedFields: params.changedFields ?? null,
    metadata: {
      invitedEmail: params.permission.invitedEmail,
      role: params.permission.role,
      roleLabel: params.permission.roleLabel,
      ...(params.metadata ?? {}),
    },
    occurredAt,
  });

  appendWalletMutation({
    id: createId('journal'),
    walletId: params.permission.walletId,
    entityType,
    entityId: params.permission.id,
    action: params.action,
    occurredAt,
    payload: {
      invitedEmail: params.permission.invitedEmail,
      role: params.permission.role,
      roleLabel: params.permission.roleLabel,
      ...(params.metadata ?? {}),
    },
  });
}
