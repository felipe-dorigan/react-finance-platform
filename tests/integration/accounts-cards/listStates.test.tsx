import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Account, Card } from '@/features/shared/types/domain';
import { AccountList } from '@/features/accounts/components/AccountList';
import { CardList } from '@/features/cards/components/CardList';

type RenderListsProps = {
  accounts?: Account[];
  cards?: Card[];
  accountsLoading?: boolean;
  cardsLoading?: boolean;
  accountsError?: string | null;
  cardsError?: string | null;
};

function renderLists({
  accounts = [],
  cards = [],
  accountsLoading = false,
  cardsLoading = false,
  accountsError = null,
  cardsError = null,
}: RenderListsProps = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <div>
        <AccountList
          accounts={accounts}
          isLoading={accountsLoading}
          error={accountsError}
        />
        <CardList cards={cards} isLoading={cardsLoading} error={cardsError} />
      </div>
    </QueryClientProvider>,
  );
}

describe('account and card list states', () => {
  it('renderiza loading para contas', async () => {
    renderLists({ accountsLoading: true });

    expect(await screen.findByText('Carregando contas...')).toBeInTheDocument();
  });

  it('renderiza estado vazio para contas', async () => {
    renderLists({ accounts: [] });

    expect(
      await screen.findByText('Nenhuma conta cadastrada para esta carteira.'),
    ).toBeInTheDocument();
  });

  it('renderiza erro para contas', async () => {
    renderLists({ accountsError: 'erro' });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nao foi possivel carregar as contas.',
    );
  });

  it('renderiza loading para cartoes', async () => {
    renderLists({ cardsLoading: true });

    expect(await screen.findByText('Carregando cartoes...')).toBeInTheDocument();
  });

  it('renderiza estado vazio para cartoes', async () => {
    renderLists({ cards: [] });

    expect(
      await screen.findByText('Nenhum cartao cadastrado para esta carteira.'),
    ).toBeInTheDocument();
  });

  it('renderiza erro para cartoes', async () => {
    renderLists({ cardsError: 'erro' });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nao foi possivel carregar os cartoes.',
    );
  });
});
