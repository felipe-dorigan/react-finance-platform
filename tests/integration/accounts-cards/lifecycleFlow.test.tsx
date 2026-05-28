import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Account, Card, Transaction } from '@/features/shared/types/domain';
import {
  __resetAccountService,
  createWalletAccount,
  listWalletAccounts,
  updateWalletAccount,
  archiveWalletAccount,
} from '@/features/accounts/accountService';
import {
  __resetCardService,
  createWalletCard,
  listWalletCards,
  updateWalletCard,
  archiveWalletCard,
} from '@/features/cards/cardService';
import { listCardLinkedRecords, type CardLinkedRecord } from '@/features/cards/cardDetailService';
import { CardDetailRecords } from '@/features/cards/components/CardDetailRecords';
import * as transactionService from '@/features/transactions/transactionService';

const WALLET_ID = 'wallet-001';

function renderLifecycleFlow() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LifecycleFlowHarness walletId={WALLET_ID} />
    </QueryClientProvider>,
  );
}

type LifecycleFlowHarnessProps = {
  walletId: string;
};

function LifecycleFlowHarness({ walletId }: LifecycleFlowHarnessProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [records, setRecords] = useState<CardLinkedRecord[]>([]);
  const [accountName, setAccountName] = useState('Conta Principal');
  const [accountBalance, setAccountBalance] = useState('1000.00');
  const [editedAccountName, setEditedAccountName] = useState('Conta Principal Editada');
  const [cardName, setCardName] = useState('Cartao Mercado');
  const [editedCardName, setEditedCardName] = useState('Cartao Mercado Editado');

  async function refreshAccounts() {
    setAccounts(await listWalletAccounts(walletId));
  }

  async function refreshCards() {
    setCards(await listWalletCards(walletId));
  }

  async function handleCreateAccount() {
    await createWalletAccount(walletId, {
      name: accountName,
      balance: accountBalance,
    });
    await refreshAccounts();
  }

  async function handleEditAccount() {
    const target = accounts[0];
    if (!target) {
      return;
    }

    await updateWalletAccount(walletId, target.id, {
      name: editedAccountName,
    });
    await refreshAccounts();
  }

  async function handleArchiveAccount() {
    const target = accounts[0];
    if (!target) {
      return;
    }

    await archiveWalletAccount(walletId, target.id);
    await refreshAccounts();
  }

  async function handleCreateCard() {
    const activeAccount = accounts.find((account) => account.status === 'active');
    if (!activeAccount) {
      return;
    }

    await createWalletCard(walletId, {
      name: cardName,
      debitAccountId: activeAccount.id,
    });
    await refreshCards();
  }

  async function handleEditCard() {
    const target = cards[0];
    if (!target) {
      return;
    }

    await updateWalletCard(walletId, target.id, {
      name: editedCardName,
    });
    await refreshCards();
  }

  async function handleArchiveCard() {
    const target = cards[0];
    if (!target) {
      return;
    }

    await archiveWalletCard(walletId, target.id);
    await refreshCards();
  }

  async function handleLoadCardDetail() {
    const target = cards[0];
    if (!target) {
      return;
    }

    const linkedRecords = await listCardLinkedRecords(walletId, target.id);
    setRecords(linkedRecords);
  }

  return (
    <main>
      <section aria-label="Conta form">
        <label htmlFor="account-name">Nome da conta</label>
        <input
          id="account-name"
          value={accountName}
          onChange={(event) => setAccountName(event.target.value)}
        />

        <label htmlFor="account-balance">Saldo inicial</label>
        <input
          id="account-balance"
          value={accountBalance}
          onChange={(event) => setAccountBalance(event.target.value)}
        />

        <label htmlFor="edited-account-name">Nome editado da conta</label>
        <input
          id="edited-account-name"
          value={editedAccountName}
          onChange={(event) => setEditedAccountName(event.target.value)}
        />

        <button type="button" onClick={handleCreateAccount}>Criar conta</button>
        <button type="button" onClick={handleEditAccount}>Editar conta</button>
        <button type="button" onClick={handleArchiveAccount}>Arquivar conta</button>
      </section>

      <section aria-label="Card form">
        <label htmlFor="card-name">Nome do cartao</label>
        <input
          id="card-name"
          value={cardName}
          onChange={(event) => setCardName(event.target.value)}
        />

        <label htmlFor="edited-card-name">Nome editado do cartao</label>
        <input
          id="edited-card-name"
          value={editedCardName}
          onChange={(event) => setEditedCardName(event.target.value)}
        />

        <button type="button" onClick={handleCreateCard}>Criar cartao</button>
        <button type="button" onClick={handleEditCard}>Editar cartao</button>
        <button type="button" onClick={handleArchiveCard}>Arquivar cartao</button>
        <button type="button" onClick={handleLoadCardDetail}>Carregar detalhe do cartao</button>
      </section>

      <section aria-label="Lista de contas">
        <h2>Contas</h2>
        <ul>
          {accounts.map((account) => (
            <li key={account.id} data-testid={`account-row-${account.id}`}>
              {account.name} - {account.status}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Lista de cartoes">
        <h2>Cartoes</h2>
        <ul>
          {cards.map((card) => (
            <li key={card.id} data-testid={`card-row-${card.id}`}>
              {card.name} - {card.status}
            </li>
          ))}
        </ul>
      </section>

      <CardDetailRecords records={records} />
    </main>
  );
}

function createTransaction(partial: Partial<Transaction>): Transaction {
  return {
    id: partial.id ?? 'tx-1',
    walletId: partial.walletId ?? WALLET_ID,
    type: partial.type ?? 'income',
    status: partial.status ?? 'effective',
    amount: partial.amount ?? '0.00',
    date: partial.date ?? '2026-05-28T00:00:00.000Z',
    period: partial.period ?? null,
    sourceAccountId: partial.sourceAccountId ?? null,
    destinationAccountId: partial.destinationAccountId ?? null,
    cardId: partial.cardId ?? null,
    cardExpensePaymentStatus: partial.cardExpensePaymentStatus ?? null,
    paidFromAccountId: partial.paidFromAccountId ?? null,
    paidAt: partial.paidAt ?? null,
  };
}

describe('accounts-cards lifecycle flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    __resetAccountService();
    __resetCardService();
  });

  it('executa ciclo basico de criacao/edicao/arquivamento e exibe detalhe do cartao com despesas e creditos vinculados (FR-003A)', async () => {
    const user = userEvent.setup();
    renderLifecycleFlow();

    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByText('Conta Principal - active')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Editar conta' }));
    expect(await screen.findByText('Conta Principal Editada - active')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Criar cartao' }));
    expect(await screen.findByText('Cartao Mercado - active')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Editar cartao' }));
    expect(await screen.findByText('Cartao Mercado Editado - active')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Arquivar conta' }));
    expect(await screen.findByText('Conta Principal Editada - inactive')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Arquivar cartao' }));
    expect(await screen.findByText('Cartao Mercado Editado - inactive')).toBeInTheDocument();

    vi.spyOn(transactionService, 'listWalletTransactions').mockResolvedValueOnce([
      createTransaction({ id: 'tx-expense', type: 'expense', amount: '230.00', cardId: 'card-1' }),
      createTransaction({ id: 'tx-credit', type: 'income', amount: '50.00', cardId: 'card-1' }),
      createTransaction({ id: 'tx-unlinked', type: 'expense', amount: '999.00', cardId: 'card-2' }),
    ]);

    await user.click(screen.getByRole('button', { name: 'Carregar detalhe do cartao' }));

    const detailList = await screen.findByLabelText('Lista de despesas e creditos vinculados');
    const detail = within(detailList);

    expect(detail.getByTestId('card-record-tx-expense')).toHaveTextContent('Despesa - R$ 230.00');
    expect(detail.getByTestId('card-record-tx-credit')).toHaveTextContent('Credito - R$ 50.00');
    expect(detail.queryByTestId('card-record-tx-unlinked')).not.toBeInTheDocument();
  });
});
