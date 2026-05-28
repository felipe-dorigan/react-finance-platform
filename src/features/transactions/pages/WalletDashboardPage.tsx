import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { walletQueryKeys } from '@/services/api/queryKeys';
import {
  createWalletTransaction,
  DuplicateConfirmationRequiredError,
  listWalletTransactions,
  type CreateTransactionInput,
} from '@/features/transactions/transactionService';
import { getWalletById } from '@/features/wallets/walletService';
import { TransactionForm } from '@/features/transactions/components/TransactionForm';
import { TransactionList } from '@/features/transactions/components/TransactionList';
import { WalletSummaryCard } from '@/features/transactions/components/WalletSummaryCard';

export function WalletDashboardPage() {
  const { walletId = '' } = useParams();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);

  const walletQuery = useQuery({
    queryKey: walletQueryKeys.detail(walletId),
    queryFn: () => getWalletById(walletId),
    enabled: walletId.length > 0,
  });

  const transactionsQuery = useQuery({
    queryKey: walletQueryKeys.transactions(walletId),
    queryFn: () => listWalletTransactions(walletId),
    enabled: walletId.length > 0,
  });

  const createTransactionMutation = useMutation({
    mutationFn: ({
      payload,
      options,
    }: {
      payload: CreateTransactionInput;
      options?: { duplicateConfirmation?: boolean };
    }) => createWalletTransaction(walletId, payload, options),
    onSuccess: async () => {
      setFeedback('Transacao criada com sucesso.');
      await queryClient.invalidateQueries({ queryKey: walletQueryKeys.transactions(walletId) });
    },
  });

  const transactions = useMemo(() => transactionsQuery.data ?? [], [transactionsQuery.data]);
  const wallet = useMemo(() => walletQuery.data, [walletQuery.data]);

  if (transactionsQuery.isPending) {
    return <p>Carregando dashboard financeiro...</p>;
  }

  if (transactionsQuery.isError) {
    return (
      <section>
        <h2>Dashboard da carteira</h2>
        <p role="alert">Nao foi possivel carregar as transacoes da carteira.</p>
        <button type="button" onClick={() => void transactionsQuery.refetch()}>
          Tentar novamente
        </button>
      </section>
    );
  }

  return (
    <section>
      <h2>Dashboard da carteira</h2>
      <p>Gerencie entradas, saidas e transferencias da carteira selecionada.</p>

      {feedback ? <p role="status">{feedback}</p> : null}

      <WalletSummaryCard
        transactions={transactions}
        initialMainBalance={wallet?.mainBalance}
        initialProjectedBalance={wallet?.projectedBalance}
      />
      <TransactionForm
        onSubmit={async (payload, options) => {
          try {
            await createTransactionMutation.mutateAsync({ payload, options });
          } catch (error) {
            if (error instanceof DuplicateConfirmationRequiredError) {
              throw error;
            }

            setFeedback('Nao foi possivel criar a transacao.');
            throw error;
          }
        }}
      />

      {transactions.length === 0 ? (
        <p>Nenhuma transacao encontrada para esta carteira.</p>
      ) : (
        <TransactionList transactions={transactions} />
      )}
    </section>
  );
}
