export const walletStatuses = ['active', 'archived'] as const;
export type WalletStatus = (typeof walletStatuses)[number];

export const accountStatuses = ['active', 'inactive'] as const;
export type AccountStatus = (typeof accountStatuses)[number];

export const cardStatuses = ['active', 'inactive'] as const;
export type CardStatus = (typeof cardStatuses)[number];

export const transactionTypes = ['income', 'expense', 'transfer'] as const;
export type TransactionType = (typeof transactionTypes)[number];

export const transactionStatuses = ['effective', 'pending'] as const;
export type TransactionStatus = (typeof transactionStatuses)[number];

export const recurrencePeriods = ['daily', 'weekly', 'monthly', 'yearly'] as const;
export type RecurrencePeriod = (typeof recurrencePeriods)[number];

export const permissionRoles = ['read', 'edit', 'operate'] as const;
export type PermissionRole = (typeof permissionRoles)[number];

export const permissionRoleLabels = [
  'leitura',
  'leitura+edicao',
  'acesso_total_operacional',
] as const;
export type PermissionRoleLabel = (typeof permissionRoleLabels)[number];

export const auditEntityTypes = ['account', 'card', 'transaction', 'invite', 'permission'] as const;
export type AuditEntityType = (typeof auditEntityTypes)[number];

export const linkRecordTypes = ['expense', 'credit'] as const;
export type LinkRecordType = (typeof linkRecordTypes)[number];

export type WalletId = string;
export type AccountId = string;
export type CardId = string;
export type TransactionId = string;
export type PermissionId = string;
export type AuditEventId = string;
export type SessionId = string;

export type Wallet = {
  id: WalletId;
  ownerId: string;
  name: string;
  timezone: string;
  status: WalletStatus;
  mainBalance: string;
  projectedBalance: string;
};

export type Account = {
  id: AccountId;
  walletId: WalletId;
  name: string;
  status: AccountStatus;
  balance: string;
};

export type Card = {
  id: CardId;
  walletId: WalletId;
  name: string;
  debitAccountId: AccountId;
  status: CardStatus;
};

export type Transaction = {
  id: TransactionId;
  walletId: WalletId;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  date: string;
  period: RecurrencePeriod | null;
  sourceAccountId: AccountId | null;
  destinationAccountId: AccountId | null;
  cardId: CardId | null;
  cardExpensePaymentStatus: 'unpaid' | 'paid' | null;
  paidFromAccountId: AccountId | null;
  paidAt: string | null;
};

export type WalletPermission = {
  id: PermissionId;
  walletId: WalletId;
  invitedEmail: string;
  role: PermissionRole;
  roleLabel: PermissionRoleLabel;
};

export type AuditEvent = {
  id: AuditEventId;
  walletId: WalletId;
  actorUserId: string | null;
  actorEmail: string | null;
  actorRole: PermissionRole | 'owner';
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  changedFields: Array<{ field: string; before: unknown; after: unknown }> | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
};

export type TelemetryEvent = {
  id: string;
  walletId: WalletId | null;
  sessionId: SessionId;
  correlationId: string;
  route: string;
  eventName: string;
  category: string;
  occurredAt: string;
  payload: Record<string, unknown> | null;
};

export type ErrorSignal = {
  id: string;
  walletId: WalletId | null;
  sessionId: SessionId;
  correlationId: string;
  route: string;
  source: string;
  message: string;
  recoverable: boolean;
  occurredAt: string;
  details: Record<string, unknown> | null;
};

export type WalletMutationJournalEntry = {
  id: string;
  walletId: WalletId;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  occurredAt: string;
  payload: Record<string, unknown> | null;
};