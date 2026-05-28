import { describe, expect, it } from 'vitest';
import { RefundRuleError, getNetRefundableAmount, validateCardRefundRules } from '@/features/cards/refundRules';

describe('card refund rules', () => {
  it('allows partial refund within refundable net limit', () => {
    expect(() =>
      validateCardRefundRules({
        originalExpenseAmount: '200.00',
        previousRefundAmounts: ['50.00'],
        requestedRefundAmount: '100.00',
      }),
    ).not.toThrow();

    expect(
      getNetRefundableAmount({
        originalExpenseAmount: '200.00',
        previousRefundAmounts: ['50.00'],
      }),
    ).toBe('150.00');
  });

  it('allows total refund when eligible', () => {
    expect(() =>
      validateCardRefundRules({
        originalExpenseAmount: '200.00',
        previousRefundAmounts: ['30.00', '20.00'],
        requestedRefundAmount: '150.00',
      }),
    ).not.toThrow();
  });

  it('blocks refund when total refunded amount exceeds refundable net amount', () => {
    expect(() =>
      validateCardRefundRules({
        originalExpenseAmount: '200.00',
        previousRefundAmounts: ['140.00', '20.00'],
        requestedRefundAmount: '50.00',
      }),
    ).toThrowError(RefundRuleError);
  });
});
