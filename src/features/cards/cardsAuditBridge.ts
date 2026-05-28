import { appendAuditEvent } from '@/features/audit/auditStore';
import { appendWalletMutation } from '@/features/persistence/walletMutationJournal';
import type { Card } from '@/features/shared/types/domain';
import { getMockSession } from '@/features/wallets/session/sessionService';

type CardAuditAction =
  | 'card.created'
  | 'card.updated'
  | 'card.archived'
  | 'card.reactivated'
  | 'card.deleted'
  | 'card.debit-account.changed';

type CardAuditActor = {
  userId: string | null;
  email: string | null;
  role: 'owner' | 'read' | 'edit' | 'operate';
};

function createId(prefix: string): string {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resolveActor(actor?: CardAuditActor): CardAuditActor {
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

export function emitCardMutationTrail(params: {
  card: Card;
  action: CardAuditAction;
  changedFields?: Array<{ field: string; before: unknown; after: unknown }>;
  metadata?: Record<string, unknown>;
  actor?: CardAuditActor;
}): void {
  const actor = resolveActor(params.actor);
  const occurredAt = new Date().toISOString();

  appendAuditEvent({
    id: createId('audit'),
    walletId: params.card.walletId,
    actorUserId: actor.userId,
    actorEmail: actor.email,
    actorRole: actor.role,
    action: params.action,
    entityType: 'card',
    entityId: params.card.id,
    changedFields: params.changedFields ?? null,
    metadata: params.metadata ?? null,
    occurredAt,
  });

  appendWalletMutation({
    id: createId('journal'),
    walletId: params.card.walletId,
    entityType: 'card',
    entityId: params.card.id,
    action: params.action,
    occurredAt,
    payload: {
      name: params.card.name,
      status: params.card.status,
      debitAccountId: params.card.debitAccountId,
      ...(params.metadata ?? {}),
    },
  });
}
