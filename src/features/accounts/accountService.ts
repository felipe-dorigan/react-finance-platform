import type { Account } from '@/features/shared/types/domain';

export type CreateAccountInput = {
  name: string;
  balance: string;
};

export type UpdateAccountInput = {
  name?: string;
  balance?: string;
};

let accountSequence = 0;
let accountStore: Account[] = [];

export function __resetAccountService(): void {
  accountSequence = 0;
  accountStore = [];
}

export function __setAccountsForTests(accounts: Account[]): void {
  accountStore = [...accounts];
  accountSequence = accounts.length;
}

export async function listWalletAccounts(walletId: string): Promise<Account[]> {
  return accountStore.filter((account) => account.walletId === walletId);
}

export async function createWalletAccount(
  walletId: string,
  input: CreateAccountInput,
): Promise<Account> {
  accountSequence += 1;

  const createdAccount: Account = {
    id: `acc-${accountSequence}`,
    walletId,
    name: input.name,
    balance: input.balance,
    status: 'active',
  };

  accountStore = [...accountStore, createdAccount];
  return createdAccount;
}

export async function updateWalletAccount(
  walletId: string,
  accountId: string,
  input: UpdateAccountInput,
): Promise<Account> {
  const index = accountStore.findIndex(
    (account) => account.id === accountId && account.walletId === walletId,
  );

  if (index === -1) {
    throw new Error('Conta nao encontrada para atualizacao.');
  }

  const updatedAccount: Account = {
    ...accountStore[index],
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.balance !== undefined ? { balance: input.balance } : {}),
  };

  accountStore = [
    ...accountStore.slice(0, index),
    updatedAccount,
    ...accountStore.slice(index + 1),
  ];

  return updatedAccount;
}

export async function archiveWalletAccount(
  walletId: string,
  accountId: string,
): Promise<Account> {
  const index = accountStore.findIndex(
    (account) => account.id === accountId && account.walletId === walletId,
  );

  if (index === -1) {
    throw new Error('Conta nao encontrada para arquivamento.');
  }

  const archivedAccount: Account = {
    ...accountStore[index],
    status: 'inactive',
  };

  accountStore = [
    ...accountStore.slice(0, index),
    archivedAccount,
    ...accountStore.slice(index + 1),
  ];

  return archivedAccount;
}
