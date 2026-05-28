import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const accountFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome para a conta.'),
  balance: z
    .string()
    .trim()
    .min(1, 'Informe um saldo inicial para a conta.')
    .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), 'Informe um saldo inicial valido.')
    .refine((value) => Number(value) >= 0, 'Informe um saldo inicial valido.'),
  status: z.enum(['active', 'inactive']),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;

type AccountFormProps = {
  onSubmit: (payload: AccountFormValues) => Promise<void> | void;
};

export function AccountForm({ onSubmit }: AccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      balance: '',
      status: 'active',
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={submit} aria-label="Formulario de conta" noValidate>
      <label htmlFor="account-name">Nome da conta</label>
      <input
        id="account-name"
        type="text"
        aria-invalid={errors.name ? 'true' : 'false'}
        aria-describedby={errors.name ? 'account-name-error' : undefined}
        {...register('name')}
      />
      {errors.name ? (
        <p id="account-name-error" role="alert" aria-live="polite">
          {errors.name.message}
        </p>
      ) : null}

      <label htmlFor="account-balance">Saldo inicial</label>
      <input
        id="account-balance"
        type="number"
        step="0.01"
        min="0"
        aria-invalid={errors.balance ? 'true' : 'false'}
        aria-describedby={errors.balance ? 'account-balance-error' : undefined}
        {...register('balance')}
      />
      {errors.balance ? (
        <p id="account-balance-error" role="alert" aria-live="polite">
          {errors.balance.message}
        </p>
      ) : null}

      <label htmlFor="account-status">Status</label>
      <select id="account-status" {...register('status')}>
        <option value="active">Ativa</option>
        <option value="inactive">Inativa</option>
      </select>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar conta'}
      </button>
    </form>
  );
}
