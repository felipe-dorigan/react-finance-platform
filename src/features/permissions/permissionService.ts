import type {
  PermissionRole,
  PermissionRoleLabel,
  WalletPermission,
} from '@/features/shared/types/domain';
import {
  permissionCollectionSchema,
  permissionRoleSchema,
  upsertPermissionRequestSchema,
  walletPermissionSchema,
} from '@/schemas/walletSchemas';
import { createApiClient } from '@/services/api/client';

const apiClient = createApiClient('');

const roleLabelByRole: Record<PermissionRole, PermissionRoleLabel> = {
  read: 'leitura',
  edit: 'leitura+edicao',
  operate: 'acesso_total_operacional',
};

export type UpsertWalletPermissionInput = {
  invitedEmail: string;
  role: PermissionRole;
};

export function getPermissionRoleLabel(role: PermissionRole): PermissionRoleLabel {
  return roleLabelByRole[role];
}

function normalizePermission(candidate: unknown): WalletPermission {
  const directParse = walletPermissionSchema.safeParse(candidate);
  if (directParse.success) {
    return directParse.data;
  }

  const fallback = candidate as Partial<WalletPermission>;
  const role = permissionRoleSchema.parse(fallback.role);

  return walletPermissionSchema.parse({
    id: fallback.id,
    walletId: fallback.walletId,
    invitedEmail: fallback.invitedEmail,
    role,
    roleLabel: getPermissionRoleLabel(role),
  });
}

export async function listWalletPermissions(walletId: string): Promise<WalletPermission[]> {
  const response = await apiClient.get<unknown[]>(`/wallets/${walletId}/permissions`);
  const parsed = permissionCollectionSchema.safeParse(response);

  if (parsed.success) {
    return parsed.data.map((permission) => ({
      ...permission,
      roleLabel: getPermissionRoleLabel(permission.role),
    }));
  }

  return response.map((item) => normalizePermission(item));
}

export async function upsertWalletPermission(
  walletId: string,
  input: UpsertWalletPermissionInput,
): Promise<WalletPermission> {
  const parsedPayload = upsertPermissionRequestSchema.parse(input);
  const response = await apiClient.post<unknown>(`/wallets/${walletId}/permissions`, parsedPayload);
  return normalizePermission(response);
}
