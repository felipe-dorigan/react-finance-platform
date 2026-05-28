import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createWalletAccount, listWalletAccounts, __resetAccountService } from '@/features/accounts/accountService';
import { createWalletCard, listWalletCards, __resetCardService } from '@/features/cards/cardService';

const WALLET_ID = 'wallet-001';

type AccountDeleteBlockedError = Error & {
  code: 'ACCOUNT_DELETE_BLOCKED_BY_LINKED_CARD';
  guidance: string;
};

function createAccountDeleteBlockedError(linkedCardName: string): AccountDeleteBlockedError {
  const error = new Error(
    `Nao e possivel excluir a conta enquanto o cartao ${linkedCardName} estiver vinculado.`,
  ) as AccountDeleteBlockedError;

  error.code = 'ACCOUNT_DELETE_BLOCKED_BY_LINKED_CARD';
  error.guidance =
    'Antes de excluir, troque a conta de debito do cartao para outra conta ativa ou desvincule o cartao.';

  return error;
}

async function deleteAccountWithLinkedCardGuard(walletId: string, accountId: string): Promise<void> {
  const cards = await listWalletCards(walletId);
  const linkedCard = cards.find((card) => card.debitAccountId === accountId && card.status === 'active');

  if (linkedCard) {
    throw createAccountDeleteBlockedError(linkedCard.name);
  }
}

function renderGuidanceHarness() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AccountDeleteGuidanceHarness walletId={WALLET_ID} />
    </QueryClientProvider>,
  );
}

type AccountDeleteGuidanceHarnessProps = {
  walletId: string;
};

function AccountDeleteGuidanceHarness({ walletId }: AccountDeleteGuidanceHarnessProps) {
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function seedData() {
    const account = await createWalletAccount(walletId, {
      name: 'Conta salario',
      balance: '1200.00',
    });

    await createWalletCard(walletId, {
      name: 'Cartao principal',
      debitAccountId: account.id,
    });

    setAccounts(await listWalletAccounts(walletId));
    setFeedback(null);
  }

  async function handleDeleteBlockedAccount() {
    const account = accounts[0];
    if (!account) {
      return;
    }

    try {
      await deleteAccountWithLinkedCardGuard(walletId, account.id);
      setFeedback('Conta excluida com sucesso.');
    } catch (error) {
      const accountDeleteError = error as Partial<AccountDeleteBlockedError>;
      if (accountDeleteError.code === 'ACCOUNT_DELETE_BLOCKED_BY_LINKED_CARD') {
        setFeedback(`${accountDeleteError.message} ${accountDeleteError.guidance}`);
        return;
      }

      setFeedback('Nao foi possivel excluir a conta.');
    }
  }

  return (
    <main>
      <button type="button" onClick={seedData}>Preparar conta com cartao vinculado</button>
      <button type="button" onClick={handleDeleteBlockedAccount}>Excluir conta vinculada</button>
      {feedback ? <p role="alert">{feedback}</p> : null}
    </main>
  );
}

describe('account delete guidance', () => {
  beforeEach(() => {
    __resetAccountService();
    __resetCardService();
  });

  it('orienta trocar conta de debito ou desvincular cartao antes de excluir conta bloqueada', async () => {
    const user = userEvent.setup();
    renderGuidanceHarness();

    await user.click(screen.getByRole('button', { name: 'Preparar conta com cartao vinculado' }));
    await user.click(screen.getByRole('button', { name: 'Excluir conta vinculada' }));

    const alert = await screen.findByRole('alert');

    expect(alert).toHaveTextContent(
      'Nao e possivel excluir a conta enquanto o cartao Cartao principal estiver vinculado.',
    );
    expect(alert).toHaveTextContent(
      'Antes de excluir, troque a conta de debito do cartao para outra conta ativa ou desvincule o cartao.',
    );
  });
});