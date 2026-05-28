import type { Card } from '@/features/shared/types/domain';

type CardListProps = {
  cards: Card[];
  isLoading?: boolean;
  error?: string | null;
};

export function CardList({
  cards,
  isLoading = false,
  error = null,
}: CardListProps) {
  if (isLoading) {
    return (
      <section aria-label="Listagem de cartoes">
        <h3>Cartoes</h3>
        <p>Carregando cartoes...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Listagem de cartoes">
        <h3>Cartoes</h3>
        <p role="alert">Nao foi possivel carregar os cartoes.</p>
      </section>
    );
  }

  if (cards.length === 0) {
    return (
      <section aria-label="Listagem de cartoes">
        <h3>Cartoes</h3>
        <p>Nenhum cartao cadastrado para esta carteira.</p>
      </section>
    );
  }

  return (
    <section aria-label="Listagem de cartoes">
      <h3>Cartoes</h3>
      <ul aria-label="Lista de cartoes">
        {cards.map((card) => (
          <li key={card.id}>{card.name}</li>
        ))}
      </ul>
    </section>
  );
}
