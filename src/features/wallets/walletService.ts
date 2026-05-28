import type { Wallet } from '@/features/shared/types/domain';
import { createApiClient } from '@/services/api/client';

const apiClient = createApiClient('');

export async function getWalletById(walletId: string): Promise<Wallet> {
  const response = await apiClient.get<Wallet>(`/wallets/${walletId}`);
  return response;
}
