import type { Transaction, TransactionType } from '@/features/shared/types/domain';
import crypto from 'crypto';

/**
 * Represents a duplicate detection candidate
 */
export type DuplicateDetectionCandidate = {
  fingerprint: string;
  walletId: string;
  transactionType: TransactionType;
  amount: string;
  date: string;
  primaryLinkType: 'account' | 'card';
  primaryLinkId: string;
  matchedTransactionId: string;
  detectedAt: string;
};

/**
 * Payload for duplicate detection
 */
export type DuplicateDetectionPayload = {
  amount: string;
  date: string;
  type: TransactionType;
  sourceAccountId: string | null;
  cardId: string | null;
};

const DUPLICATE_DETECTION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generates a fingerprint hash from transaction key fields
 * Used to identify potentially duplicate transactions
 *
 * @param amount - Transaction amount
 * @param date - Transaction date in ISO 8601 format (UTC)
 * @param type - Transaction type (income, expense, transfer)
 * @param primaryLinkId - Account ID or Card ID (primary financial link)
 * @returns SHA256 hash fingerprint
 */
export function generateDuplicateFingerprint(
  amount: string,
  date: string,
  type: TransactionType,
  primaryLinkId: string,
): string {
  // Extract only the date part (YYYY-MM-DD) for fingerprinting
  // This allows the 5-minute window to detect near-duplicates on the same day
  const dateOnly = date.split('T')[0];
  const combined = `${amount}|${dateOnly}|${type}|${primaryLinkId}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Determines the primary financial link type and ID from a transaction payload
 */
function getPrimaryLink(payload: DuplicateDetectionPayload): { type: 'account' | 'card'; id: string } | null {
  if (payload.cardId) {
    return { type: 'card', id: payload.cardId };
  }
  if (payload.sourceAccountId) {
    return { type: 'account', id: payload.sourceAccountId };
  }
  return null;
}

/**
 * Determines the primary financial link type and ID from a transaction
 */
function getTransactionPrimaryLink(tx: Transaction): { type: 'account' | 'card'; id: string } | null {
  if (tx.cardId) {
    return { type: 'card', id: tx.cardId };
  }
  if (tx.sourceAccountId) {
    return { type: 'account', id: tx.sourceAccountId };
  }
  return null;
}

/**
 * Checks if a transaction has critical field changes during edit
 * Critical fields: amount, date, type, sourceAccountId, cardId
 */
function hasCriticalFieldChange(
  original: Transaction,
  updated: DuplicateDetectionPayload,
): boolean {
  // Check amount change
  if (original.amount !== updated.amount) {
    return true;
  }

  // Check date change
  if (original.date !== updated.date) {
    return true;
  }

  // Check type change
  if (original.type !== updated.type) {
    return true;
  }

  // Check primary link change
  const originalLink = getTransactionPrimaryLink(original);
  const updatedLink = getPrimaryLink(updated);

  if (originalLink?.type !== updatedLink?.type || originalLink?.id !== updatedLink?.id) {
    return true;
  }

  return false;
}

/**
 * Detects if a transaction payload matches an existing transaction as a potential duplicate
 * within the 5-minute detection window
 *
 * For creation: Returns a candidate if an existing transaction matches within the window
 * For edit: Returns a candidate only if:
 *   1. A matching transaction exists within the window AND
 *   2. At least one critical field has changed (amount, date, type, or primary link)
 *
 * @param walletId - Wallet ID context
 * @param payload - Transaction payload to check (with amount, date, type, links)
 * @param existingTransactions - Array of existing transactions to check against
 * @param originalTransaction - Optional original transaction (if editing); if provided, enables edit-specific logic
 * @returns DuplicateDetectionCandidate if match found, null otherwise
 */
export function detectDuplicateCandidate(
  walletId: string,
  payload: DuplicateDetectionPayload,
  existingTransactions: Transaction[],
  originalTransaction?: Transaction,
): DuplicateDetectionCandidate | null {
  const payloadLink = getPrimaryLink(payload);
  if (!payloadLink) {
    return null;
  }

  const payloadFingerprint = generateDuplicateFingerprint(
    payload.amount,
    payload.date,
    payload.type,
    payloadLink.id,
  );

  const payloadTime = new Date(payload.date).getTime();
  const windowStartTime = payloadTime - DUPLICATE_DETECTION_WINDOW_MS;
  const windowEndTime = payloadTime + DUPLICATE_DETECTION_WINDOW_MS;

  for (const tx of existingTransactions) {
    // Skip the transaction being edited
    if (originalTransaction && tx.id === originalTransaction.id) {
      continue;
    }

    const txTime = new Date(tx.date).getTime();

    // Check if transaction is within the 5-minute window (inclusive on both ends)
    if (txTime < windowStartTime || txTime > windowEndTime) {
      continue;
    }

    const txLink = getTransactionPrimaryLink(tx);
    if (!txLink) {
      continue;
    }

    // Check if fingerprints match
    const txFingerprint = generateDuplicateFingerprint(
      tx.amount,
      tx.date,
      tx.type,
      txLink.id,
    );

    if (payloadFingerprint !== txFingerprint) {
      continue;
    }

    // If editing, only flag as duplicate if critical field changed
    if (originalTransaction) {
      if (!hasCriticalFieldChange(originalTransaction, payload)) {
        continue;
      }
    }

    // Match found!
    return {
      fingerprint: payloadFingerprint,
      walletId,
      transactionType: payload.type,
      amount: payload.amount,
      date: payload.date,
      primaryLinkType: payloadLink.type,
      primaryLinkId: payloadLink.id,
      matchedTransactionId: tx.id,
      detectedAt: new Date().toISOString(),
    };
  }

  return null;
}
