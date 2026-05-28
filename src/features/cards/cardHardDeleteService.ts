import { deleteWalletCard } from '@/features/cards/cardService';
import type { Transaction } from '@/features/shared/types/domain';
import {
  recalculateAfterCardHardDelete,
  type HardDeleteRecalculationResult,
} from '@/features/transactions/hardDeleteRecalculation';

export type CardHardDeletePayload = {
  walletId: string;
  cardId: string;
  transactions: Transaction[];
  initialMainBalance?: string;
  initialProjectedBalance?: string;
};

export type CardHardDeleteResult = HardDeleteRecalculationResult & {
  deletedCardId: string;
};

export async function hardDeleteCardAndRecalculate(
  payload: CardHardDeletePayload,
): Promise<CardHardDeleteResult> {
  await deleteWalletCard(payload.walletId, payload.cardId);

  const recalculation = recalculateAfterCardHardDelete(
    {
      transactions: payload.transactions,
      initialMainBalance: payload.initialMainBalance,
      initialProjectedBalance: payload.initialProjectedBalance,
    },
    payload.cardId,
  );

  return {
    deletedCardId: payload.cardId,
    ...recalculation,
  };
}
