import type { WalletMutationJournalEntry } from '@/features/shared/types/domain';

const mutationJournal: WalletMutationJournalEntry[] = [];

export function appendWalletMutation(entry: WalletMutationJournalEntry): WalletMutationJournalEntry {
  mutationJournal.push(structuredClone(entry));
  return entry;
}

export function listWalletMutations(walletId?: string): WalletMutationJournalEntry[] {
  const entries = walletId ? mutationJournal.filter((entry) => entry.walletId === walletId) : mutationJournal;
  return structuredClone(entries);
}

export function clearWalletMutationJournal(): void {
  mutationJournal.length = 0;
}