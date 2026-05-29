import type { PermissionRole, WalletPermission } from '@/features/shared/types/domain';
import { upsertPermissionRequestSchema } from '@/schemas/walletSchemas';
import { createApiClient } from '@/services/api/client';
import { getPermissionRoleLabel } from '@/features/permissions/permissionService';

const apiClient = createApiClient('');

export type CreateWalletInvitationInput = {
  invitedEmail: string;
  role: PermissionRole;
};

export async function createWalletInvitation(
  walletId: string,
  input: CreateWalletInvitationInput,
): Promise<WalletPermission> {
  const parsedPayload = upsertPermissionRequestSchema.parse(input);
  const response = (await apiClient.post(`/wallets/${walletId}/invites`, parsedPayload)) as Partial<WalletPermission>;

  return {
    id: response.id ?? `perm-${Date.now()}`,
    walletId: response.walletId ?? walletId,
    invitedEmail: response.invitedEmail ?? parsedPayload.invitedEmail,
    role: parsedPayload.role,
    roleLabel: getPermissionRoleLabel(parsedPayload.role),
  };
}
