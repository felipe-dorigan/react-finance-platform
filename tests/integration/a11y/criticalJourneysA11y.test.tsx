import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TransactionForm } from '@/features/transactions/components/TransactionForm';
import { AccountForm } from '@/features/accounts/components/AccountForm';
import { CardForm } from '@/features/cards/components/CardForm';

describe('critical journeys basic a11y', () => {
  it('garante navegacao por teclado, labels e mensagens de erro nos formularios criticos', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <main>
        <TransactionForm onSubmit={onSubmit} />
        <AccountForm onSubmit={onSubmit} />
        <CardForm
          debitAccountOptions={[{ id: 'acc-1', label: 'Conta principal' }]}
          onSubmit={onSubmit}
        />
      </main>,
    );

    expect(screen.getByLabelText('Tipo')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor')).toBeInTheDocument();
    expect(screen.getByLabelText('Data')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome da conta')).toBeInTheDocument();
    expect(screen.getByLabelText('Saldo inicial')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome do cartao')).toBeInTheDocument();
    expect(screen.getByLabelText('Conta de debito')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Valor'));
    await user.click(screen.getByRole('button', { name: 'Salvar transacao' }));
    expect(await screen.findByText('Informe um valor para a transacao.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar conta' }));
    expect(await screen.findByText('Informe um nome para a conta.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar cartao' }));
    expect(await screen.findByText('Informe um nome para o cartao.')).toBeInTheDocument();

    screen.getByLabelText('Tipo').focus();
    await user.tab();
    expect(screen.getByLabelText('Status', { selector: 'select#status' })).toHaveFocus();
  });
});
