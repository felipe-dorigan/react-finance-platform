import { describe, expect, it } from 'vitest';
import type { Transaction } from '@/features/shared/types/domain';
import {
  generateDuplicateFingerprint,
  detectDuplicateCandidate,
} from '@/features/transactions/duplicateDetectionService';

function createTransaction(partial: Partial<Transaction>): Transaction {
  return {
    id: partial.id ?? 'tx-1',
    walletId: partial.walletId ?? 'wallet-001',
    type: partial.type ?? 'income',
    status: partial.status ?? 'effective',
    amount: partial.amount ?? '0.00',
    date: partial.date ?? '2026-05-28T12:00:00.000Z',
    period: partial.period ?? null,
    sourceAccountId: partial.sourceAccountId ?? null,
    destinationAccountId: partial.destinationAccountId ?? null,
    cardId: partial.cardId ?? null,
    cardExpensePaymentStatus: partial.cardExpensePaymentStatus ?? null,
    paidFromAccountId: partial.paidFromAccountId ?? null,
    paidAt: partial.paidAt ?? null,
  };
}

describe('duplicate detection with 5-minute window', () => {
  describe('fingerprint generation', () => {
    it('generates consistent fingerprint for same amount-date-type-primaryLinkId', () => {
      const fp1 = generateDuplicateFingerprint('100.00', '2026-05-28T12:00:00.000Z', 'expense', 'account-001');
      const fp2 = generateDuplicateFingerprint('100.00', '2026-05-28T12:00:00.000Z', 'expense', 'account-001');

      expect(fp1).toBe(fp2);
    });

    it('generates different fingerprint for different amount', () => {
      const fp1 = generateDuplicateFingerprint('100.00', '2026-05-28T12:00:00.000Z', 'expense', 'account-001');
      const fp2 = generateDuplicateFingerprint('100.01', '2026-05-28T12:00:00.000Z', 'expense', 'account-001');

      expect(fp1).not.toBe(fp2);
    });

    it('generates different fingerprint for different date', () => {
      const fp1 = generateDuplicateFingerprint('100.00', '2026-05-28T12:00:00.000Z', 'expense', 'account-001');
      const fp2 = generateDuplicateFingerprint('100.00', '2026-05-29T12:00:00.000Z', 'expense', 'account-001');

      expect(fp1).not.toBe(fp2);
    });

    it('generates different fingerprint for different type', () => {
      const fp1 = generateDuplicateFingerprint('100.00', '2026-05-28T12:00:00.000Z', 'expense', 'account-001');
      const fp2 = generateDuplicateFingerprint('100.00', '2026-05-28T12:00:00.000Z', 'income', 'account-001');

      expect(fp1).not.toBe(fp2);
    });

    it('generates different fingerprint for different primaryLinkId', () => {
      const fp1 = generateDuplicateFingerprint('100.00', '2026-05-28T12:00:00.000Z', 'expense', 'account-001');
      const fp2 = generateDuplicateFingerprint('100.00', '2026-05-28T12:00:00.000Z', 'expense', 'account-002');

      expect(fp1).not.toBe(fp2);
    });
  });

  describe('duplicate candidate detection', () => {
    it('detects duplicate when same fingerprint exists within 5-minute window on creation', () => {
      const referenceDate = '2026-05-28T12:00:00.000Z';
      const existingTransactions = [
        createTransaction({
          id: 'tx-existing',
          amount: '100.00',
          date: referenceDate,
          type: 'expense',
          sourceAccountId: 'account-001',
        }),
      ];

      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.00',
        date: referenceDate,
        type: 'expense',
        sourceAccountId: 'account-001',
        cardId: null,
      }, existingTransactions, undefined);

      expect(result).not.toBeNull();
      expect(result?.matchedTransactionId).toBe('tx-existing');
      expect(result?.walletId).toBe('wallet-001');
      expect(result?.transactionType).toBe('expense');
    });

    it('does not detect duplicate outside 5-minute window', () => {
      const baseDate = new Date('2026-05-28T12:00:00.000Z');
      const existingDate = new Date(baseDate.getTime() - 6 * 60 * 1000); // 6 minutes before
      const existingTransactions = [
        createTransaction({
          id: 'tx-existing',
          amount: '100.00',
          date: existingDate.toISOString(),
          type: 'expense',
          sourceAccountId: 'account-001',
        }),
      ];

      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.00',
        date: baseDate.toISOString(),
        type: 'expense',
        sourceAccountId: 'account-001',
        cardId: null,
      }, existingTransactions, undefined);

      expect(result).toBeNull();
    });

    it('detects duplicate within 5-minute window boundary (4:59)', () => {
      const baseDate = new Date('2026-05-28T12:00:00.000Z');
      const existingDate = new Date(baseDate.getTime() - 4 * 60 * 1000 - 59 * 1000); // 4:59 before
      const existingTransactions = [
        createTransaction({
          id: 'tx-existing',
          amount: '100.00',
          date: existingDate.toISOString(),
          type: 'expense',
          sourceAccountId: 'account-001',
        }),
      ];

      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.00',
        date: baseDate.toISOString(),
        type: 'expense',
        sourceAccountId: 'account-001',
        cardId: null,
      }, existingTransactions, undefined);

      expect(result).not.toBeNull();
    });

    it('does not detect duplicate when amount differs', () => {
      const referenceDate = '2026-05-28T12:00:00.000Z';
      const existingTransactions = [
        createTransaction({
          id: 'tx-existing',
          amount: '100.00',
          date: referenceDate,
          type: 'expense',
          sourceAccountId: 'account-001',
        }),
      ];

      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.01',
        date: referenceDate,
        type: 'expense',
        sourceAccountId: 'account-001',
        cardId: null,
      }, existingTransactions, undefined);

      expect(result).toBeNull();
    });

    it('does not detect duplicate when type differs', () => {
      const referenceDate = '2026-05-28T12:00:00.000Z';
      const existingTransactions = [
        createTransaction({
          id: 'tx-existing',
          amount: '100.00',
          date: referenceDate,
          type: 'expense',
          sourceAccountId: 'account-001',
        }),
      ];

      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.00',
        date: referenceDate,
        type: 'income',
        sourceAccountId: 'account-001',
        cardId: null,
      }, existingTransactions, undefined);

      expect(result).toBeNull();
    });

    it('does not detect duplicate when sourceAccountId differs', () => {
      const referenceDate = '2026-05-28T12:00:00.000Z';
      const existingTransactions = [
        createTransaction({
          id: 'tx-existing',
          amount: '100.00',
          date: referenceDate,
          type: 'expense',
          sourceAccountId: 'account-001',
        }),
      ];

      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.00',
        date: referenceDate,
        type: 'expense',
        sourceAccountId: 'account-002',
        cardId: null,
      }, existingTransactions, undefined);

      expect(result).toBeNull();
    });

    it('detects duplicate when cardId is primary link and matches', () => {
      const referenceDate = '2026-05-28T12:00:00.000Z';
      const existingTransactions = [
        createTransaction({
          id: 'tx-existing',
          amount: '100.00',
          date: referenceDate,
          type: 'expense',
          cardId: 'card-001',
        }),
      ];

      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.00',
        date: referenceDate,
        type: 'expense',
        sourceAccountId: null,
        cardId: 'card-001',
      }, existingTransactions, undefined);

      expect(result).not.toBeNull();
      expect(result?.primaryLinkType).toBe('card');
      expect(result?.primaryLinkId).toBe('card-001');
    });

    it('on edit: triggers only when amount changes', () => {
      const referenceDate = '2026-05-28T12:00:00.000Z';
      const originalTransaction = createTransaction({
        id: 'tx-original',
        amount: '100.00',
        date: referenceDate,
        type: 'expense',
        sourceAccountId: 'account-001',
      });
      const existingTransactions = [
        createTransaction({
          id: 'tx-other',
          amount: '100.01',
          date: referenceDate,
          type: 'expense',
          sourceAccountId: 'account-001',
        }),
      ];

      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.01',
        date: referenceDate,
        type: 'expense',
        sourceAccountId: 'account-001',
        cardId: null,
      }, existingTransactions, originalTransaction);

      expect(result).not.toBeNull();
    });

    it('on edit: does not trigger when only non-critical fields change', () => {
      const referenceDate = '2026-05-28T12:00:00.000Z';
      const originalTransaction = createTransaction({
        id: 'tx-original',
        amount: '100.00',
        date: referenceDate,
        type: 'expense',
        sourceAccountId: 'account-001',
        period: null,
      });
      const existingTransactions = [
        createTransaction({
          id: 'tx-other',
          amount: '100.00',
          date: referenceDate,
          type: 'expense',
          sourceAccountId: 'account-001',
        }),
      ];

      // Same amount, date, type, sourceAccountId - should not detect because no critical field changed
      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.00',
        date: referenceDate,
        type: 'expense',
        sourceAccountId: 'account-001',
        cardId: null,
      }, existingTransactions, originalTransaction);

      expect(result).toBeNull();
    });

    it('on edit: triggers when date changes', () => {
      const referenceDate = '2026-05-28T12:00:00.000Z';
      const newDate = '2026-05-28T12:02:00.000Z';
      const originalTransaction = createTransaction({
        id: 'tx-original',
        amount: '100.00',
        date: referenceDate,
        type: 'expense',
        sourceAccountId: 'account-001',
      });
      const existingTransactions = [
        createTransaction({
          id: 'tx-other',
          amount: '100.00',
          date: newDate,
          type: 'expense',
          sourceAccountId: 'account-001',
        }),
      ];

      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.00',
        date: newDate,
        type: 'expense',
        sourceAccountId: 'account-001',
        cardId: null,
      }, existingTransactions, originalTransaction);

      expect(result).not.toBeNull();
    });

    it('on edit: triggers when type changes', () => {
      const referenceDate = '2026-05-28T12:00:00.000Z';
      const originalTransaction = createTransaction({
        id: 'tx-original',
        amount: '100.00',
        date: referenceDate,
        type: 'expense',
        sourceAccountId: 'account-001',
      });
      const existingTransactions = [
        createTransaction({
          id: 'tx-other',
          amount: '100.00',
          date: referenceDate,
          type: 'income',
          sourceAccountId: 'account-001',
        }),
      ];

      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.00',
        date: referenceDate,
        type: 'income',
        sourceAccountId: 'account-001',
        cardId: null,
      }, existingTransactions, originalTransaction);

      expect(result).not.toBeNull();
    });

    it('on edit: triggers when sourceAccountId changes', () => {
      const referenceDate = '2026-05-28T12:00:00.000Z';
      const originalTransaction = createTransaction({
        id: 'tx-original',
        amount: '100.00',
        date: referenceDate,
        type: 'expense',
        sourceAccountId: 'account-001',
      });
      const existingTransactions = [
        createTransaction({
          id: 'tx-other',
          amount: '100.00',
          date: referenceDate,
          type: 'expense',
          sourceAccountId: 'account-002',
        }),
      ];

      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.00',
        date: referenceDate,
        type: 'expense',
        sourceAccountId: 'account-002',
        cardId: null,
      }, existingTransactions, originalTransaction);

      expect(result).not.toBeNull();
    });

    it('on edit: triggers when cardId changes', () => {
      const referenceDate = '2026-05-28T12:00:00.000Z';
      const originalTransaction = createTransaction({
        id: 'tx-original',
        amount: '100.00',
        date: referenceDate,
        type: 'expense',
        cardId: 'card-001',
      });
      const existingTransactions = [
        createTransaction({
          id: 'tx-other',
          amount: '100.00',
          date: referenceDate,
          type: 'expense',
          cardId: 'card-002',
        }),
      ];

      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.00',
        date: referenceDate,
        type: 'expense',
        sourceAccountId: null,
        cardId: 'card-002',
      }, existingTransactions, originalTransaction);

      expect(result).not.toBeNull();
    });

    it('returns null when no matching transactions exist', () => {
      const result = detectDuplicateCandidate('wallet-001', {
        amount: '100.00',
        date: '2026-05-28T12:00:00.000Z',
        type: 'expense',
        sourceAccountId: 'account-001',
        cardId: null,
      }, [], undefined);

      expect(result).toBeNull();
    });
  });
});
