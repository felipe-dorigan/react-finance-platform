import type { ReactNode } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import type { PermissionRole, WalletPermission } from '@/features/shared/types/domain';
import { getMockSession } from '@/features/wallets/session/sessionService';
import { getMockWallet } from '@/services/mock/handlers';

const roleWeight: Record<PermissionRole | 'owner', number> = {
  read: 1,
  edit: 2,
  operate: 3,
  owner: 4,
};

export function canAccessWallet(requiredRole: PermissionRole | 'owner', permission: WalletPermission | null | undefined): boolean {
  if (!permission) {
    return false;
  }

  if (permission.role === 'operate' || permission.role === 'edit' || permission.role === 'read') {
    return roleWeight[permission.role] >= roleWeight[requiredRole];
  }

  return false;
}

export function hasRouteAccess(requiredRole: PermissionRole | 'owner'): boolean {
  const session = getMockSession();
  return roleWeight[session.role] >= roleWeight[requiredRole];
}

type GuardProps = {
  requiredRole?: PermissionRole | 'owner';
  children: ReactNode;
};

export function WalletGuard({ children, requiredRole = 'read' }: GuardProps) {
  const location = useLocation();
  const params = useParams();
  const walletId = params.walletId;

  if (!walletId || !getMockWallet(walletId)) {
    return <Navigate to="/wallet-not-found" replace state={{ from: location.pathname }} />;
  }

  if (!hasRouteAccess(requiredRole)) {
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