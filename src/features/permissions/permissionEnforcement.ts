import type { MockSession } from '@/features/wallets/session/sessionService';
import type { PermissionRole, WalletPermission } from '@/features/shared/types/domain';

export type WalletActorRole = PermissionRole | 'owner';

const roleWeight: Record<WalletActorRole, number> = {
  read: 1,
  edit: 2,
  operate: 3,
  owner: 4,
};

export function hasRequiredPermissionRole(
  requiredRole: WalletActorRole,
  currentRole: WalletActorRole | null | undefined,
): boolean {
  if (!currentRole) {
    return false;
  }

  return roleWeight[currentRole] >= roleWeight[requiredRole];
}

export function canManageWalletCollaborators(currentRole: WalletActorRole | null | undefined): boolean {
  return currentRole === 'owner';
}

export function resolveSessionWalletRole(
  walletId: string,
  session: Pick<MockSession, 'role' | 'walletId' | 'permissions'>,
): WalletActorRole | null {
  if (session.walletId === walletId) {
    return session.role;
  }

  const scopedPermission = session.permissions.find(
    (permission: WalletPermission) => permission.walletId === walletId,
  );

  return scopedPermission?.role ?? null;
}

export function getRoleRestrictionMessage(currentRole: WalletActorRole | null | undefined): string {
  if (currentRole === 'owner') {
    return '';
  }

  return 'Somente o dono da carteira pode convidar e alterar niveis de acesso.';
}
