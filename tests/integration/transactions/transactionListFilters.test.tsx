import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Transaction } from '@/features/shared/types/domain';
import { TransactionList } from '@/features/transactions/components/TransactionList';

const transactions: Transaction[] = [
  {
    id: 'tx-1',
    walletId: 'wallet-001',
    type: 'income',
    status: 'effective',
    amount: '120.00',
    date: '2026-05-28T00:00:00.000Z',
    period: 'monthly',
    sourceAccountId: null,
    destinationAccountId: null,
    cardId: null,
    cardExpensePaymentStatus: null,
    paidFromAccountId: null,
    paidAt: null,
  },
  {
    id: 'tx-2',
    walletId: 'wallet-001',
    type: 'expense',
    status: 'pending',
    amount: '50.00',
    date: '2026-05-28T01:00:00.000Z',
    period: null,
    sourceAccountId: 'account-001',
    destinationAccountId: null,
    cardId: null,
    cardExpensePaymentStatus: null,
    paidFromAccountId: null,
    paidAt: null,
  },
];

describe('transaction list filters', () => {
  it('filtra por status e periodo', async () => {
    const user = userEvent.setup();
    render(<TransactionList transactions={transactions} />);

    expect(screen.getByText(/income/)).toBeInTheDocument();
    expect(screen.getByText(/expense/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Filtrar por status'), 'pending');
    expect(screen.queryByText(/income/)).not.toBeInTheDocument();
    expect(screen.getByText(/expense/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Filtrar por periodo'), 'monthly');
    expect(screen.getByText('Nenhuma transacao corresponde aos filtros selecionados.')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Filtrar por status'), 'all');
    expect(screen.getByText(/income/)).toBeInTheDocument();
    expect(screen.queryByText(/expense/)).not.toBeInTheDocument();
  });
});
