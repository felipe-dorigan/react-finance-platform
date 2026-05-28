import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  __resetAccountService,
  createWalletAccount,
  deleteWalletAccount,
  listWalletAccounts,
} from '@/features/accounts/accountService';
import { __resetCardService, createWalletCard } from '@/features/cards/cardService';
import type { Account } from '@/features/shared/types/domain';

const WALLET_ID = 'wallet-001';

function renderAccountDeleteGuardHarness() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AccountDeleteGuardHarness walletId={WALLET_ID} />
    </QueryClientProvider>,
  );
}

type AccountDeleteGuardHarnessProps = {
  walletId: string;
};

function AccountDeleteGuardHarness({ walletId }: AccountDeleteGuardHarnessProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function refreshAccounts() {
    setAccounts(await listWalletAccounts(walletId));
  }

  async function handleCreateLinkedData() {
    const createdAccount = await createWalletAccount(walletId, {
      name: 'Conta vinculada',
      balance: '300.00',
    });

    await createWalletCard(walletId, {
      name: 'Cartao principal',
      debitAccountId: createdAccount.id,
    });

    await refreshAccounts();
    setFeedback(null);
  }

  async function handleDeleteAccount() {
    const targetAccount = accounts[0];
    if (!targetAccount) {
      return;
    }

    try {
      await deleteWalletAccount(walletId, targetAccount.id);
      setFeedback('Conta excluida com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao excluir conta.');
    }

    await refreshAccounts();
  }

  return (
    <main>
      <section aria-label="Acoes da conta">
        <button type="button" onClick={handleCreateLinkedData}>Criar conta com cartao vinculado</button>
        <button type="button" onClick={handleDeleteAccount}>Excluir conta vinculada</button>
      </section>

      {feedback ? <p role="alert">{feedback}</p> : null}

      <section aria-label="Lista de contas">
        <h2>Contas</h2>
        <ul>
          {accounts.map((account) => (
            <li key={account.id} data-testid={`account-row-${account.id}`}>
              {account.name}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

describe('account delete guard', () => {
  beforeEach(() => {
    __resetAccountService();
    __resetCardService();
  });

  it('bloqueia exclusao de conta com cartao vinculado, exibe mensagem e mantem a conta', async () => {
    const user = userEvent.setup();

    renderAccountDeleteGuardHarness();

    await user.click(screen.getByRole('button', { name: 'Criar conta com cartao vinculado' }));

    expect(await screen.findByText('Conta vinculada')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Excluir conta vinculada' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Conta possui cartao vinculado ativo e nao pode ser excluida.',
    );

    expect(screen.getByText('Conta vinculada')).toBeInTheDocument();
    expect((await listWalletAccounts(WALLET_ID)).map((account) => account.name)).toContain(
      'Conta vinculada',
    );
  });
});
