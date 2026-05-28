import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AccountForm } from '@/features/accounts/components/AccountForm';
import { CardForm } from '@/features/cards/components/CardForm';

describe('accounts and cards forms validation', () => {
  it('bloqueia envio invalido do AccountForm e exibe mensagens por campo', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<AccountForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Salvar conta' }));

    expect(await screen.findByText('Informe um nome para a conta.')).toBeInTheDocument();
    expect(await screen.findByText('Informe um saldo inicial para a conta.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('bloqueia envio invalido do CardForm e exibe mensagens por campo', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <CardForm
        debitAccountOptions={[{ id: 'acc-1', label: 'Conta principal' }]}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Salvar cartao' }));

    expect(await screen.findByText('Informe um nome para o cartao.')).toBeInTheDocument();
    expect(await screen.findByText('Selecione uma conta de debito.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
