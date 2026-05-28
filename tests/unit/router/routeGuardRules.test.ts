import { describe, expect, it } from 'vitest';
import type { WalletPermission } from '@/features/shared/types/domain';
import { canAccessWallet, hasRouteAccess } from '@/app/router/guards';

describe('route guard rules', () => {
  it('allows owner access to protected routes', () => {
    expect(hasRouteAccess('read')).toBe(true);
    expect(hasRouteAccess('owner')).toBe(true);
  });

  it('validates wallet permissions by role hierarchy', () => {
    expect(canAccessWallet('read', { role: 'edit' } as WalletPermission)).toBe(true);
    expect(canAccessWallet('owner', { role: 'operate' } as WalletPermission)).toBe(false);
    expect(canAccessWallet('read', null)).toBe(false);
  });
});