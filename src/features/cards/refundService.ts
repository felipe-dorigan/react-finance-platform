import { compareMoney } from '@/lib/money';
import { getNetRefundableAmount, validateCardRefundRules } from '@/features/cards/refundRules';

export type CreateRefundInput = {
  walletId: string;
  originalTransactionId: string;
  originalExpenseAmount: string;
  previousRefundAmounts: string[];
  requestedRefundAmount: string;
};

export type RefundRecord = {
  id: string;
  walletId: string;
  originalTransactionId: string;
  amount: string;
  refundType: 'partial' | 'total';
  createdAt: string;
};

function createRefundId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `refund-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resolveRefundType(netRefundableAmount: string, requestedRefundAmount: string): 'partial' | 'total' {
  return compareMoney(requestedRefundAmount, netRefundableAmount) === 0 ? 'total' : 'partial';
}

export function createCardRefund(input: CreateRefundInput): RefundRecord {
  validateCardRefundRules({
    originalExpenseAmount: input.originalExpenseAmount,
    previousRefundAmounts: input.previousRefundAmounts,
    requestedRefundAmount: input.requestedRefundAmount,
  });

  const netRefundableAmount = getNetRefundableAmount({
    originalExpenseAmount: input.originalExpenseAmount,
    previousRefundAmounts: input.previousRefundAmounts,
  });

  return {
    id: createRefundId(),
    walletId: input.walletId,
    originalTransactionId: input.originalTransactionId,
    amount: input.requestedRefundAmount,
    refundType: resolveRefundType(netRefundableAmount, input.requestedRefundAmount),
    createdAt: new Date().toISOString(),
  };
}
