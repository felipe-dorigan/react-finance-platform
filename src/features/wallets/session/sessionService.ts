import type { WalletPermission } from '@/features/shared/types/domain';

export type MockSession = {
  userId: string;
  email: string;
  role: 'owner' | 'read' | 'edit' | 'operate';
  walletId: string;
  permissions: WalletPermission[];
};

const mockSession: MockSession = {
  userId: 'user-001',
  email: 'owner@finance.dev',
  role: 'owner',
  walletId: 'wallet-001',
  permissions: [],
};

export function loadMockSession(): Promise<MockSession> {
  return Promise.resolve(structuredClone(mockSession));
}

export function getMockSession(): MockSession {
  return structuredClone(mockSession);
}