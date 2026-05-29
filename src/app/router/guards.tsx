import type { ReactNode } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import type { PermissionRole, WalletPermission } from '@/features/shared/types/domain';
import { getMockSession } from '@/features/wallets/session/sessionService';
import {
  hasRequiredPermissionRole,
  resolveSessionWalletRole,
  type WalletActorRole,
} from '@/features/permissions/permissionEnforcement';
import { getMockWallet } from '@/services/mock/handlers';

export function canAccessWallet(requiredRole: PermissionRole | 'owner', permission: WalletPermission | null | undefined): boolean {
  return hasRequiredPermissionRole(requiredRole, permission?.role ?? null);
}

export function hasRouteAccess(requiredRole: PermissionRole | 'owner', currentRole?: WalletActorRole | null): boolean {
  if (currentRole) {
    return hasRequiredPermissionRole(requiredRole, currentRole);
  }

  const session = getMockSession();
  return hasRequiredPermissionRole(requiredRole, session.role);
}

type GuardProps = {
  requiredRole?: PermissionRole | 'owner';
  children: ReactNode;
};

export function WalletGuard({ children, requiredRole = 'read' }: GuardProps) {
  const location = useLocation();
  const params = useParams();
  const walletId = params.walletId;
  const session = getMockSession();

  if (!walletId || !getMockWallet(walletId)) {
    return <Navigate to="/wallet-not-found" replace state={{ from: location.pathname }} />;
  }

  const currentRole = resolveSessionWalletRole(walletId, session);
  if (!hasRouteAccess(requiredRole, currentRole)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const session = getMockSession();
  if (!session.userId) {
    return <Navigate to="/login" replace />;
  }

  return children;
}