import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export type CardFormValues = {
  name: string;
  debitAccountId: string;
  status: 'active' | 'inactive';
};

type CardFormProps = {
  debitAccountOptions?: Array<{ id: string; label: string }>;
  onSubmit: (payload: CardFormValues) => Promise<void> | void;
};

export function CardForm({ debitAccountOptions = [], onSubmit }: CardFormProps) {
  const availableAccountIds = new Set(debitAccountOptions.map((option) => option.id));
  const cardFormSchema = z.object({
    name: z.string().trim().min(1, 'Informe um nome para o cartao.'),
    debitAccountId: z
      .string()
      .trim()
      .min(1, 'Selecione uma conta de debito.')
      .refine(
        (value) => availableAccountIds.has(value),
        'Selecione uma conta de debito.',
      ),
    status: z.enum(['active', 'inactive']),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      name: '',
      debitAccountId: '',
      status: 'active',
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={submit} aria-label="Formulario de cartao" noValidate>
      <label htmlFor="card-name">Nome do cartao</label>
      <input
        id="card-name"
        type="text"
        aria-invalid={errors.name ? 'true' : 'false'}
        aria-describedby={errors.name ? 'card-name-error' : undefined}
        {...register('name')}
      />
      {errors.name ? (
        <p id="card-name-error" role="alert" aria-live="polite">
          {errors.name.message}
        </p>
      ) : null}

      <label htmlFor="card-debit-account">Conta de debito</label>
      <select
        id="card-debit-account"
        aria-invalid={errors.debitAccountId ? 'true' : 'false'}
        aria-describedby={errors.debitAccountId ? 'card-debit-account-error' : undefined}
        {...register('debitAccountId')}
      >
        <option value="">Selecione</option>
        {debitAccountOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {errors.debitAccountId ? (
        <p id="card-debit-account-error" role="alert" aria-live="polite">
          {errors.debitAccountId.message}
        </p>
      ) : null}

      <label htmlFor="card-status">Status</label>
      <select id="card-status" {...register('status')}>
        <option value="active">Ativo</option>
        <option value="inactive">Inativo</option>
      </select>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar cartao'}
      </button>
    </form>
  );
}
