import { describe, expect, it } from 'vitest';
import {
  canManageWalletCollaborators,
  getRoleRestrictionMessage,
  hasRequiredPermissionRole,
  resolveSessionWalletRole,
} from '@/features/permissions/permissionEnforcement';
import { getPermissionRoleLabel } from '@/features/permissions/permissionService';

describe('permission matrix and role mapping', () => {
  it('aplica hierarquia read-edit-operate-owner corretamente', () => {
    expect(hasRequiredPermissionRole('read', 'read')).toBe(true);
    expect(hasRequiredPermissionRole('edit', 'read')).toBe(false);
    expect(hasRequiredPermissionRole('edit', 'operate')).toBe(true);
    expect(hasRequiredPermissionRole('operate', 'owner')).toBe(true);
    expect(hasRequiredPermissionRole('read', null)).toBe(false);
  });

  it('mapeia labels de papeis para leitura, leitura+edicao e acesso total operacional', () => {
    expect(getPermissionRoleLabel('read')).toBe('leitura');
    expect(getPermissionRoleLabel('edit')).toBe('leitura+edicao');
    expect(getPermissionRoleLabel('operate')).toBe('acesso_total_operacional');
  });

  it('resolve papel da sessao por carteira e restringe gestao de colaboradores ao owner', () => {
    const session = {
      role: 'owner' as const,
      walletId: 'wallet-001',
      permissions: [
        {
          id: 'perm-1',
          walletId: 'wallet-002',
          invitedEmail: 'guest@finance.dev',
          role: 'edit' as const,
          roleLabel: 'leitura+edicao' as const,
        },
      ],
    };

    expect(resolveSessionWalletRole('wallet-001', session)).toBe('owner');
    expect(resolveSessionWalletRole('wallet-002', session)).toBe('edit');
    expect(resolveSessionWalletRole('wallet-003', session)).toBeNull();

    expect(canManageWalletCollaborators('owner')).toBe(true);
    expect(canManageWalletCollaborators('operate')).toBe(false);
    expect(getRoleRestrictionMessage('read')).toBe('Somente o dono da carteira pode convidar e alterar niveis de acesso.');
  });
});