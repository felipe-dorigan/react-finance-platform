import type { Account } from '@/features/shared/types/domain';

type AccountListProps = {
  accounts: Account[];
  isLoading?: boolean;
  error?: string | null;
};

export function AccountList({
  accounts,
  isLoading = false,
  error = null,
}: AccountListProps) {
  if (isLoading) {
    return (
      <section aria-label="Listagem de contas">
        <h3>Contas</h3>
        <p role="status" aria-live="polite">Carregando contas...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Listagem de contas">
        <h3>Contas</h3>
        <p role="alert">Nao foi possivel carregar as contas.</p>
        <p>{error}</p>
      </section>
    );
  }

  if (accounts.length === 0) {
    return (
      <section aria-label="Listagem de contas">
        <h3>Contas</h3>
        <p role="status">Nenhuma conta cadastrada para esta carteira.</p>
      </section>
    );
  }

  return (
    <section aria-label="Listagem de contas">
      <h3>Contas</h3>
      <ul aria-label="Lista de contas">
        {accounts.map((account) => (
          <li key={account.id}>{account.name}</li>
        ))}
      </ul>
    </section>
  );
}
