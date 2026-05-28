import { z } from 'zod';
import { recurrencePeriods, transactionStatuses, transactionTypes } from '@/features/shared/types/domain';

export const transactionTypeSchema = z.enum(transactionTypes);
export const transactionStatusSchema = z.enum(transactionStatuses);
export const recurrencePeriodSchema = z.enum(recurrencePeriods);

export const transactionSchema = z.object({
  id: z.string().min(1),
  walletId: z.string().min(1),
  type: transactionTypeSchema,
  status: transactionStatusSchema,
  amount: z.string().min(1),
  date: z.string().datetime(),
  period: recurrencePeriodSchema.nullable(),
  sourceAccountId: z.string().nullable(),
  destinationAccountId: z.string().nullable(),
  cardId: z.string().nullable(),
  cardExpensePaymentStatus: z.enum(['unpaid', 'paid']).nullable(),
  paidFromAccountId: z.string().nullable(),
  paidAt: z.string().datetime().nullable(),
});

export const expenseSchema = transactionSchema.extend({
  type: z.literal('expense'),
});

export const duplicateDetectionCandidateSchema = z.object({
  fingerprint: z.string().min(1),
  walletId: z.string().min(1),
  transactionType: transactionTypeSchema,
  amount: z.string().min(1),
  date: z.string().datetime(),
  primaryLinkType: z.enum(['account', 'card']),
  primaryLinkId: z.string().min(1),
  matchedTransactionId: z.string().min(1),
  detectedAt: z.string().datetime(),
});

export const duplicateDetectionErrorSchema = z.object({
  code: z.literal('POSSIBLE_DUPLICATE'),
  message: z.string().min(1),
  duplicateCandidate: duplicateDetectionCandidateSchema,
});

export const changeCardDebitAccountRequestSchema = z.object({
  debitAccountId: z.string().min(1),
});

export const createCardLinkedRecordRequestSchema = z.object({
  type: z.enum(['expense', 'credit']),
  amount: z.string().min(1),
  occurredAt: z.string().datetime(),
  originalTransactionId: z.string().nullable().optional(),
});

export const createTransactionRequestSchema = z.object({
  type: transactionTypeSchema,
  status: transactionStatusSchema,
  amount: z.string().min(1),
  date: z.string().datetime(),
  period: recurrencePeriodSchema.nullable().optional(),
  sourceAccountId: z.string().nullable().optional(),
  destinationAccountId: z.string().nullable().optional(),
  cardId: z.string().nullable().optional(),
  duplicateConfirmation: z.boolean().optional().default(false),
});

export const updateTransactionRequestSchema = createTransactionRequestSchema.extend({
  period: recurrencePeriodSchema.nullable().optional(),
});

export const payExpenseRequestSchema = z.object({
  paidFromAccountId: z.string().min(1),
});