import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardDetailRecords } from '@/features/cards/components/CardDetailRecords';

describe('CardDetailRecords', () => {
  it('renderiza estado de loading', () => {
    render(<CardDetailRecords records={[]} isLoading />);

    expect(screen.getByText('Carregando registros vinculados...')).toBeInTheDocument();
  });

  it('renderiza estado de erro', () => {
    render(<CardDetailRecords records={[]} error="erro" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Nao foi possivel carregar os registros vinculados.');
  });

  it('renderiza estado vazio', () => {
    render(<CardDetailRecords records={[]} />);

    expect(screen.getByText('Nenhum registro vinculado encontrado para este cartao.')).toBeInTheDocument();
  });

  it('renderiza lista de despesas e creditos vinculados', () => {
    render(
      <CardDetailRecords
        records={[
          {
            id: 'record-001',
            cardId: 'card-001',
            type: 'expense',
            amount: '120.00',
            occurredAt: '2026-05-28T10:00:00.000Z',
            originalTransactionId: 'tx-001',
          },
          {
            id: 'record-002',
            cardId: 'card-001',
            type: 'credit',
            amount: '45.00',
            occurredAt: '2026-05-29T10:00:00.000Z',
            originalTransactionId: null,
          },
        ]}
      />,
    );

    expect(screen.getByTestId('card-record-record-001')).toHaveTextContent('Despesa - R$ 120.00');
    expect(screen.getByTestId('card-record-record-002')).toHaveTextContent('Credito - R$ 45.00');
  });
});
