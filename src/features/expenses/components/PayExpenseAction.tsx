import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletQueryKeys } from '@/services/api/queryKeys';
import { payCardExpense } from '@/features/expenses/expenseService';

type PayExpenseActionProps = {
  walletId: string;
  expenseId: string;
  expenseAmount: string;
  accounts: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
};

export function PayExpenseAction({
  walletId,
  expenseId,
  expenseAmount,
  accounts,
  onSuccess,
}: PayExpenseActionProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const payExpenseMutation = useMutation({
    mutationFn: () => payCardExpense(walletId, expenseId, selectedAccountId),
    onSuccess: async () => {
      setFeedback('Despesa paga com sucesso.');
      setSelectedAccountId('');
      await queryClient.invalidateQueries({ queryKey: walletQueryKeys.expenses(walletId) });
      onSuccess?.();
    },
    onError: () => {
      setFeedback('Não foi possível pagar a despesa.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccountId) {
      setFeedback('Selecione uma conta para débito.');
      return;
    }

    await payExpenseMutation.mutateAsync();
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={`Formulário para pagar despesa de R$ ${expenseAmount}`}
      noValidate
    >
      <fieldset>
        <legend>Pagar despesa</legend>

        {feedback ? <p role="status">{feedback}</p> : null}

        <label htmlFor={`account-selector-${expenseId}`}>Conta para débito:</label>
        <select
          id={`account-selector-${expenseId}`}
          value={selectedAccountId}
          onChange={(e) => {
            setSelectedAccountId(e.target.value);
            setFeedback(null);
          }}
          disabled={payExpenseMutation.isPending}
        >
          <option value="">-- Selecione uma conta --</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={payExpenseMutation.isPending || !selectedAccountId}
        >
          {payExpenseMutation.isPending ? 'Processando...' : 'Pagar'}
        </button>
      </fieldset>
    </form>
  );
}
