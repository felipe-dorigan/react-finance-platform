import { z } from 'zod';
import { cardStatuses, linkRecordTypes } from '@/features/shared/types/domain';
import { createApiClient } from '@/services/api/client';

const apiClient = createApiClient('');

const cardSchema = z.object({
  id: z.string().min(1),
  walletId: z.string().min(1),
  name: z.string().min(1),
  debitAccountId: z.string().min(1),
  status: z.enum(cardStatuses),
});

const cardLinkedRecordSchema = z.object({
  id: z.string().min(1),
  cardId: z.string().min(1),
  type: z.enum(linkRecordTypes),
  amount: z.string().min(1),
  originalTransactionId: z.string().nullable().optional(),
  occurredAt: z.string().datetime(),
});

const cardDetailResponseSchema = z.object({
  card: cardSchema,
  linkedRecords: z.array(cardLinkedRecordSchema),
});

export type CardLinkedRecord = {
  id: string;
  cardId: string;
  type: z.infer<typeof cardLinkedRecordSchema>['type'];
  amount: string;
  originalTransactionId?: string | null;
  occurredAt: string;
};

export type CardDetailResponse = {
  card: z.infer<typeof cardSchema>;
  linkedRecords: CardLinkedRecord[];
};

export async function getCardDetailWithLinkedRecords(
  walletId: string,
  cardId: string,
): Promise<CardDetailResponse> {
  const response = await apiClient.get<unknown>(`/wallets/${walletId}/cards/${cardId}`);
  return cardDetailResponseSchema.parse(response);
}

export async function listCardLinkedRecords(
  walletId: string,
  cardId: string,
): Promise<CardLinkedRecord[]> {
  const detail = await getCardDetailWithLinkedRecords(walletId, cardId);
  return detail.linkedRecords;
}
