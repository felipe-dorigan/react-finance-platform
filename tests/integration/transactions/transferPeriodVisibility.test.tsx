import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TransactionForm } from '@/features/transactions/components/TransactionForm';

describe('transfer period visibility', () => {
  it('oculta e limpa periodo ao selecionar transferencia', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TransactionForm onSubmit={onSubmit} />);

    await user.selectOptions(screen.getByLabelText('Periodo'), 'yearly');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'transfer');

    expect(screen.queryByLabelText('Periodo')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Valor'), '100.00');
    await user.type(screen.getByLabelText('Data'), '2026-05-28');
    await user.type(screen.getByLabelText('Conta de origem'), 'account-001');
    await user.type(screen.getByLabelText('Conta de destino'), 'account-002');
    await user.click(screen.getByRole('button', { name: 'Salvar transacao' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'transfer',
        period: null,
      }),
    );
  });
});
