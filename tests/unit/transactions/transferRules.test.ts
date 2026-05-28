import { describe, expect, it } from 'vitest';
import { TransactionRuleError, validateTransferRules } from '@/features/transactions/transactionService';

describe('transfer rules', () => {
  it('accepts valid transfer without recurrence', () => {
    expect(() =>
      validateTransferRules({
        type: 'transfer',
        sourceAccountId: 'account-001',
        destinationAccountId: 'account-002',
        period: null,
        cardId: null,
      }),
    ).not.toThrow();
  });

  it('rejects recurring transfer', () => {
    expect(() =>
      validateTransferRules({
        type: 'transfer',
        sourceAccountId: 'account-001',
        destinationAccountId: 'account-002',
        period: 'monthly',
        cardId: null,
      }),
    ).toThrowError(TransactionRuleError);
  });

  it('rejects transfer with card as financial link (FR-004A)', () => {
    expect(() =>
      validateTransferRules({
        type: 'transfer',
        sourceAccountId: 'account-001',
        destinationAccountId: 'account-002',
        period: null,
        cardId: 'card-001',
      }),
    ).toThrowError(TransactionRuleError);
  });
});
