import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TransactionForm } from '@/features/transactions/components/TransactionForm';

describe('transaction form validation', () => {
  it('bloqueia envio invalido e exibe mensagens por campo', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TransactionForm onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText('Valor'));
    await user.click(screen.getByRole('button', { name: 'Salvar transacao' }));

    expect(await screen.findByText('Informe um valor para a transacao.')).toBeInTheDocument();
    expect(await screen.findByText('Informe uma data para a transacao.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
