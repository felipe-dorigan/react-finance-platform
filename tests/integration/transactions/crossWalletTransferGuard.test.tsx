import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '@/services/mock/handlers';
import { ApiError } from '@/services/api/client';
import { createWalletTransaction } from '@/features/transactions/transactionService';

const server = setupServer(...handlers);

describe('cross-wallet transfer guard (FR-005)', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('bloqueia transferencia entre contas de carteiras diferentes', async () => {
    await expect(
      createWalletTransaction('wallet-001', {
        type: 'transfer',
        status: 'effective',
        amount: '50.00',
        date: '2026-05-29T00:00:00.000Z',
        period: null,
        sourceAccountId: 'account-001',
        destinationAccountId: 'account-003',
        cardId: null,
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
    } satisfies Partial<ApiError>);
  });
});
