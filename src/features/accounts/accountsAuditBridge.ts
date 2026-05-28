import { appendAuditEvent } from '@/features/audit/auditStore';
import { appendWalletMutation } from '@/features/persistence/walletMutationJournal';
import type { Account } from '@/features/shared/types/domain';
import { getMockSession } from '@/features/wallets/session/sessionService';

type AccountAuditAction =
  | 'account.created'
  | 'account.updated'
  | 'account.archived'
  | 'account.reactivated'
  | 'account.deleted';

type AccountAuditActor = {
  userId: string | null;
  email: string | null;
  role: 'owner' | 'read' | 'edit' | 'operate';
};

function createId(prefix: string): string {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resolveActor(actor?: AccountAuditActor): AccountAuditActor {
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

export function emitAccountMutationTrail(params: {
  account: Account;
  action: AccountAuditAction;
  changedFields?: Array<{ field: string; before: unknown; after: unknown }>;
  metadata?: Record<string, unknown>;
  actor?: AccountAuditActor;
}): void {
  const actor = resolveActor(params.actor);
  const occurredAt = new Date().toISOString();

  appendAuditEvent({
    id: createId('audit'),
    walletId: params.account.walletId,
    actorUserId: actor.userId,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: params.action,
    entityType: 'account',
    entityId: params.account.id,
    changedFields: params.changedFields ?? null,
    metadata: params.metadata ?? null,
    occurredAt,
  });

  appendWalletMutation({
    id: createId('journal'),
    walletId: params.account.walletId,
    entityType: 'account',
    entityId: params.account.id,
    action: params.action,
    occurredAt,
    payload: {
      name: params.account.name,
      status: params.account.status,
      balance: params.account.balance,
      ...(params.metadata ?? {}),
    },
  });
}
