import { appendAuditEvent } from '@/features/audit/auditStore';
import { appendWalletMutation } from '@/features/persistence/walletMutationJournal';
import type { Transaction } from '@/features/shared/types/domain';
import { getMockSession } from '@/features/wallets/session/sessionService';

type TransactionAuditActor = {
  userId: string | null;
  email: string | null;
  role: 'owner' | 'read' | 'edit' | 'operate';
};

function generateId(prefix: string): string {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resolveActor(actor?: TransactionAuditActor): TransactionAuditActor {
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

export function emitTransactionCreatedMutationTrail(
  transaction: Transaction,
  actor?: TransactionAuditActor,
): void {
  const resolvedActor = resolveActor(actor);
  const occurredAt = new Date().toISOString();

  appendAuditEvent({
    id: generateId('audit'),
    walletId: transaction.walletId,
    actorUserId: resolvedActor.userId,
    actorEmail: resolvedActor.email,
    actorRole: resolvedActor.role,
    action: 'transaction.created',
    entityType: 'transaction',
    entityId: transaction.id,
    changedFields: null,
    metadata: {
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount,
      date: transaction.date,
      sourceAccountId: transaction.sourceAccountId,
      destinationAccountId: transaction.destinationAccountId,
      cardId: transaction.cardId,
    },
    occurredAt,
  });

  appendWalletMutation({
    id: generateId('journal'),
    walletId: transaction.walletId,
    entityType: 'transaction',
    entityId: transaction.id,
    action: 'transaction.created',
    occurredAt,
    payload: {
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount,
      date: transaction.date,
      period: transaction.period,
      sourceAccountId: transaction.sourceAccountId,
      destinationAccountId: transaction.destinationAccountId,
      cardId: transaction.cardId,
    },
  });
}
