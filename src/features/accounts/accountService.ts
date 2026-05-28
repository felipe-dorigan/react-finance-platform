import type { Account } from '@/features/shared/types/domain';
import { listWalletCards } from '@/features/cards/cardService';

export type CreateAccountInput = {
  name: string;
  balance: string;
};

export type UpdateAccountInput = {
  name?: string;
  balance?: string;
};

export class AccountDeleteBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountDeleteBlockedError';
  }
}

export class AccountDeleteBlockedByLinkedCardError extends AccountDeleteBlockedError {
  readonly code = 'ACCOUNT_DELETE_BLOCKED_BY_LINKED_CARD';
  readonly guidance =
    'Antes de excluir, troque a conta de debito do cartao para outra conta ativa ou desvincule o cartao.';
  readonly linkedCardIds: string[];

  constructor(linkedCardIds: string[]) {
    super('Conta possui cartao vinculado ativo e nao pode ser excluida.');
    this.name = 'AccountDeleteBlockedByLinkedCardError';
    this.linkedCardIds = [...linkedCardIds];
  }
}

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

export async function reactivateWalletAccount(
  walletId: string,
  accountId: string,
): Promise<Account> {
  const index = accountStore.findIndex(
    (account) => account.id === accountId && account.walletId === walletId,
  );

  if (index === -1) {
    throw new Error('Conta nao encontrada para reativacao.');
  }

  const reactivatedAccount: Account = {
    ...accountStore[index],
    status: 'active',
  };

  accountStore = [
    ...accountStore.slice(0, index),
    reactivatedAccount,
    ...accountStore.slice(index + 1),
  ];

  return reactivatedAccount;
}

export async function deleteWalletAccount(
  walletId: string,
  accountId: string,
): Promise<void> {
  const cards = await listWalletCards(walletId);
  const linkedActiveCards = cards.filter(
    (card) => card.debitAccountId === accountId && card.status === 'active',
  );

  if (linkedActiveCards.length > 0) {
    throw new AccountDeleteBlockedByLinkedCardError(linkedActiveCards.map((card) => card.id));
  }

  const index = accountStore.findIndex(
    (account) => account.id === accountId && account.walletId === walletId,
  );

  if (index === -1) {
    throw new Error('Conta nao encontrada para exclusao.');
  }

  accountStore = [...accountStore.slice(0, index), ...accountStore.slice(index + 1)];
}
