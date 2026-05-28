export const walletQueryKeys = {
  all: ['wallets'] as const,
  detail: (walletId: string) => ['wallets', walletId] as const,
  accounts: (walletId: string) => ['wallets', walletId, 'accounts'] as const,
  cards: (walletId: string) => ['wallets', walletId, 'cards'] as const,
  transactions: (walletId: string) => ['wallets', walletId, 'transactions'] as const,
  expenses: (walletId: string) => ['wallets', walletId, 'expenses'] as const,
  permissions: (walletId: string) => ['wallets', walletId, 'permissions'] as const,
  auditEvents: (walletId: string) => ['wallets', walletId, 'audit-events'] as const,
};

export const telemetryQueryKeys = {
  all: ['telemetry'] as const,
  events: ['telemetry', 'events'] as const,
};

export const errorSignalQueryKeys = {
  all: ['error-signals'] as const,
};