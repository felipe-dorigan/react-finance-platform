import { compareMoney, isMoneyPositive, subtractMoney, sumMoney } from '@/lib/money';

type RefundRulePayload = {
  originalExpenseAmount: string;
  previousRefundAmounts: string[];
  requestedRefundAmount: string;
};

export class RefundRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RefundRuleError';
  }
}

export function getNetRefundableAmount(payload: Omit<RefundRulePayload, 'requestedRefundAmount'>): string {
  const refundedAmount = sumMoney(payload.previousRefundAmounts);
  const netRefundableAmount = subtractMoney(payload.originalExpenseAmount, refundedAmount);

  if (compareMoney(netRefundableAmount, '0.00') <= 0) {
    return '0.00';
  }

  return netRefundableAmount;
}

export function validateCardRefundRules(payload: RefundRulePayload): void {
  if (!isMoneyPositive(payload.requestedRefundAmount)) {
    throw new RefundRuleError('Valor de estorno deve ser maior que zero.');
  }

  const netRefundableAmount = getNetRefundableAmount(payload);
  const refundComparison = compareMoney(payload.requestedRefundAmount, netRefundableAmount);

  if (refundComparison === 1) {
    throw new RefundRuleError('Soma de estornos excede o valor liquido estornavel.');
  }
}
