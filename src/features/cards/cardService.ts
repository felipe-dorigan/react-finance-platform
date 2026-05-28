import type { Card } from '@/features/shared/types/domain';

export type CreateCardInput = {
  name: string;
  debitAccountId: string;
};

export type UpdateCardInput = {
  name?: string;
  debitAccountId?: string;
};

let cardSequence = 0;
let cardStore: Card[] = [];

export function __resetCardService(): void {
  cardSequence = 0;
  cardStore = [];
}

export function __setCardsForTests(cards: Card[]): void {
  cardStore = [...cards];
  cardSequence = cards.length;
}

export async function listWalletCards(walletId: string): Promise<Card[]> {
  return cardStore.filter((card) => card.walletId === walletId);
}

export async function createWalletCard(
  walletId: string,
  input: CreateCardInput,
): Promise<Card> {
  cardSequence += 1;

  const createdCard: Card = {
    id: `card-${cardSequence}`,
    walletId,
    name: input.name,
    debitAccountId: input.debitAccountId,
    status: 'active',
  };

  cardStore = [...cardStore, createdCard];
  return createdCard;
}

export async function updateWalletCard(
  walletId: string,
  cardId: string,
  input: UpdateCardInput,
): Promise<Card> {
  const index = cardStore.findIndex((card) => card.id === cardId && card.walletId === walletId);

  if (index === -1) {
    throw new Error('Cartao nao encontrado para atualizacao.');
  }

  const updatedCard: Card = {
    ...cardStore[index],
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.debitAccountId !== undefined ? { debitAccountId: input.debitAccountId } : {}),
  };

  cardStore = [...cardStore.slice(0, index), updatedCard, ...cardStore.slice(index + 1)];
  return updatedCard;
}

export async function archiveWalletCard(walletId: string, cardId: string): Promise<Card> {
  const index = cardStore.findIndex((card) => card.id === cardId && card.walletId === walletId);

  if (index === -1) {
    throw new Error('Cartao nao encontrado para arquivamento.');
  }

  const archivedCard: Card = {
    ...cardStore[index],
    status: 'inactive',
  };

  cardStore = [...cardStore.slice(0, index), archivedCard, ...cardStore.slice(index + 1)];
  return archivedCard;
}
