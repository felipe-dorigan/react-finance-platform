import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const refundFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Informe um valor para estorno.')
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), 'Informe um valor de estorno valido.'),
  reason: z.string().trim().min(1, 'Informe o motivo do estorno.'),
});

export type RefundFormValues = z.infer<typeof refundFormSchema>;

type RefundFormProps = {
  onSubmit: (payload: RefundFormValues) => Promise<void> | void;
};

export function RefundForm({ onSubmit }: RefundFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RefundFormValues>({
    resolver: zodResolver(refundFormSchema),
    defaultValues: {
      amount: '',
      reason: '',
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={submit} aria-label="Formulario de estorno" noValidate>
      <label htmlFor="refund-amount">Valor do estorno</label>
      <input
        id="refund-amount"
        type="number"
        step="0.01"
        min="0"
        aria-invalid={errors.amount ? 'true' : 'false'}
        aria-describedby={errors.amount ? 'refund-amount-error' : undefined}
        {...register('amount')}
      />
      {errors.amount ? (
        <p id="refund-amount-error" role="alert" aria-live="polite">
          {errors.amount.message}
        </p>
      ) : null}

      <label htmlFor="refund-reason">Motivo</label>
      <textarea
        id="refund-reason"
        aria-invalid={errors.reason ? 'true' : 'false'}
        aria-describedby={errors.reason ? 'refund-reason-error' : undefined}
        {...register('reason')}
      />
      {errors.reason ? (
        <p id="refund-reason-error" role="alert" aria-live="polite">
          {errors.reason.message}
        </p>
      ) : null}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Processando...' : 'Registrar estorno'}
      </button>
    </form>
  );
}
