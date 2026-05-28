import type { Transaction, TransactionType } from '@/features/shared/types/domain';
import { ApiError } from '@/services/api/client';
import { createApiClient } from '@/services/api/client';
import {
  createTransactionRequestSchema,
  duplicateDetectionErrorSchema,
  transactionSchema,
} from '@/schemas/transactionSchemas';
import type { DuplicateDetectionCandidate } from '@/features/transactions/duplicateDetectionService';
import { emitTransactionCreatedMutationTrail } from '@/features/transactions/transactionAuditBridge';

const apiClient = createApiClient('');

type TransferValidationPayload = Pick<
  Transaction,
  'type' | 'period' | 'sourceAccountId' | 'destinationAccountId' | 'cardId'
>;

export class TransactionRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionRuleError';
  }
}

export class DuplicateConfirmationRequiredError extends Error {
  readonly candidate: DuplicateDetectionCandidate;

  constructor(message: string, candidate: DuplicateDetectionCandidate) {
    super(message);
    this.name = 'DuplicateConfirmationRequiredError';
    this.candidate = candidate;
  }
}

export type CreateTransactionInput = {
  type: TransactionType;
  status: 'effective' | 'pending';
  amount: string;
  date: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  sourceAccountId?: string | null;
  destinationAccountId?: string | null;
  cardId?: string | null;
};

export type CreateWalletTransactionOptions = {
  duplicateConfirmation?: boolean;
};

type NormalizedTransactionInput = Omit<CreateTransactionInput, 'period' | 'sourceAccountId' | 'destinationAccountId' | 'cardId'> & {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  sourceAccountId: string | null;
  destinationAccountId: string | null;
  cardId: string | null;
};

export function requiresRecurrence(type: TransactionType): boolean {
  return type === 'income' || type === 'expense';
}

export function validateTransferRules(payload: TransferValidationPayload): void {
  if (payload.type !== 'transfer') {
    return;
  }

  if (!payload.sourceAccountId || !payload.destinationAccountId) {
    throw new TransactionRuleError('Transferencia exige conta de origem e destino.');
  }

  if (payload.sourceAccountId === payload.destinationAccountId) {
    throw new TransactionRuleError('Transferencia exige contas diferentes.');
  }

  if (payload.period !== null) {
    throw new TransactionRuleError('Transferencia nao pode ser recorrente.');
  }

  if (payload.cardId !== null) {
    throw new TransactionRuleError('Cartao nao pode ser origem ou destino financeiro em transferencia.');
  }
}

function normalizeTransactionInput(payload: CreateTransactionInput): NormalizedTransactionInput {
  const period = payload.type === 'transfer' ? null : (payload.period ?? null);

  return {
    ...payload,
    period,
    sourceAccountId: payload.sourceAccountId ?? null,
    destinationAccountId: payload.destinationAccountId ?? null,
    cardId: payload.cardId ?? null,
  };
}

export function validateTransactionRules(payload: CreateTransactionInput): CreateTransactionInput {
  const normalized = normalizeTransactionInput(payload);
  validateTransferRules(normalized);
  return normalized;
}

export async function listWalletTransactions(walletId: string): Promise<Transaction[]> {
  const response = await apiClient.get<unknown[]>(`/wallets/${walletId}/transactions`);
  return response.map((item) => transactionSchema.parse(item));
}

export async function createWalletTransaction(
  walletId: string,
  payload: CreateTransactionInput,
  options?: CreateWalletTransactionOptions,
): Promise<Transaction> {
  const normalized = validateTransactionRules(payload);
  const parsedPayload = createTransactionRequestSchema.parse({
    ...normalized,
    duplicateConfirmation: options?.duplicateConfirmation ?? false,
  });

  try {
    const response = await apiClient.post<unknown>(`/wallets/${walletId}/transactions`, parsedPayload);
    const createdTransaction = transactionSchema.parse(response);
    emitTransactionCreatedMutationTrail(createdTransaction);
    return createdTransaction;
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      const duplicateError = duplicateDetectionErrorSchema.parse(error.payload);
      throw new DuplicateConfirmationRequiredError(duplicateError.message, duplicateError.duplicateCandidate);
    }

    throw error;
  }
}
