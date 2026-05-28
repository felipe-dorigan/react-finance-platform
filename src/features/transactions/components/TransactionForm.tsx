import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateTransactionInput } from '@/features/transactions/transactionService';

const transactionFormSchema = z
  .object({
    type: z.enum(['income', 'expense', 'transfer']),
    status: z.enum(['effective', 'pending']),
    amount: z
      .string()
      .trim()
      .min(1, 'Informe um valor para a transacao.')
      .refine((value) => Number(value) > 0, 'Informe um valor maior que zero.'),
    date: z.string().trim().min(1, 'Informe uma data para a transacao.'),
    period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).nullable(),
    sourceAccountId: z.string().trim().nullable(),
    destinationAccountId: z.string().trim().nullable(),
    cardId: z.string().trim().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.type !== 'transfer') {
      return;
    }

    if (!value.sourceAccountId) {
      ctx.addIssue({
        path: ['sourceAccountId'],
        code: z.ZodIssueCode.custom,
        message: 'Transferencia exige conta de origem.',
      });
    }

    if (!value.destinationAccountId) {
      ctx.addIssue({
        path: ['destinationAccountId'],
        code: z.ZodIssueCode.custom,
        message: 'Transferencia exige conta de destino.',
      });
    }

    if (value.sourceAccountId && value.destinationAccountId && value.sourceAccountId === value.destinationAccountId) {
      ctx.addIssue({
        path: ['destinationAccountId'],
        code: z.ZodIssueCode.custom,
        message: 'Transferencia exige contas diferentes.',
      });
    }
  });

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

type TransactionFormProps = {
  onSubmit: (payload: CreateTransactionInput) => Promise<void>;
};

export function TransactionForm({ onSubmit }: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'expense',
      status: 'effective',
      amount: '',
      date: '',
      period: 'monthly',
      sourceAccountId: null,
      destinationAccountId: null,
      cardId: null,
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (selectedType === 'transfer') {
      setValue('period', null, { shouldDirty: true, shouldValidate: true });
    }
  }, [selectedType, setValue]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      type: values.type,
      status: values.status,
      amount: values.amount,
      date: `${values.date}T00:00:00.000Z`,
      period: selectedType === 'transfer' ? null : values.period,
      sourceAccountId: values.sourceAccountId,
      destinationAccountId: values.destinationAccountId,
      cardId: values.cardId,
    });
  });

  return (
    <form onSubmit={submit} aria-label="Formulario de transacao" noValidate>
      <label htmlFor="type">Tipo</label>
      <select id="type" {...register('type')}>
        <option value="income">Entrada</option>
        <option value="expense">Saida</option>
        <option value="transfer">Transferencia</option>
      </select>

      <label htmlFor="status">Status</label>
      <select id="status" {...register('status')}>
        <option value="effective">Efetivada</option>
        <option value="pending">Pendente</option>
      </select>

      <label htmlFor="amount">Valor</label>
      <input id="amount" type="number" step="0.01" min="0" {...register('amount')} />
      {errors.amount ? <p role="alert">{errors.amount.message}</p> : null}

      <label htmlFor="date">Data</label>
      <input id="date" type="date" {...register('date')} />
      {errors.date ? <p role="alert">{errors.date.message}</p> : null}

      {selectedType === 'transfer' ? (
        <>
          <label htmlFor="sourceAccountId">Conta de origem</label>
          <input id="sourceAccountId" {...register('sourceAccountId')} />
          {errors.sourceAccountId ? <p role="alert">{errors.sourceAccountId.message}</p> : null}

          <label htmlFor="destinationAccountId">Conta de destino</label>
          <input id="destinationAccountId" {...register('destinationAccountId')} />
          {errors.destinationAccountId ? <p role="alert">{errors.destinationAccountId.message}</p> : null}
        </>
      ) : (
        <>
          <label htmlFor="period">Periodo</label>
          <select id="period" {...register('period')}>
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
        </>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar transacao'}
      </button>
    </form>
  );
}
