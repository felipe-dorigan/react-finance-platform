import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCardDetailWithLinkedRecords, listCardLinkedRecords } from '@/features/cards/cardDetailService';

describe('cardDetailService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('busca o detalhe do cartao com registros vinculados no endpoint-view FR-003A', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          card: {
            id: 'card-001',
            walletId: 'wallet-001',
            name: 'Cartao Teste',
            debitAccountId: 'acc-001',
            status: 'active',
          },
          linkedRecords: [
            {
              id: 'record-001',
              cardId: 'card-001',
              type: 'expense',
              amount: '230.00',
              originalTransactionId: 'tx-001',
              occurredAt: '2026-05-28T10:00:00.000Z',
            },
            {
              id: 'record-002',
              cardId: 'card-001',
              type: 'credit',
              amount: '50.00',
              originalTransactionId: null,
              occurredAt: '2026-05-29T10:00:00.000Z',
            },
          ],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          card: {
            id: 'card-001',
            walletId: 'wallet-001',
            name: 'Cartao Teste',
            debitAccountId: 'acc-001',
            status: 'active',
          },
          linkedRecords: [
            {
              id: 'record-001',
              cardId: 'card-001',
              type: 'expense',
              amount: '230.00',
              originalTransactionId: 'tx-001',
              occurredAt: '2026-05-28T10:00:00.000Z',
            },
            {
              id: 'record-002',
              cardId: 'card-001',
              type: 'credit',
              amount: '50.00',
              originalTransactionId: null,
              occurredAt: '2026-05-29T10:00:00.000Z',
            },
          ],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    const detail = await getCardDetailWithLinkedRecords('wallet-001', 'card-001');

    expect(detail.card.id).toBe('card-001');
    expect(detail.linkedRecords).toHaveLength(2);
    expect(detail.linkedRecords[0]).toMatchObject({
      id: 'record-001',
      cardId: 'card-001',
      type: 'expense',
      amount: '230.00',
    });

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      '/wallets/wallet-001/cards/card-001',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );

    const records = await listCardLinkedRecords('wallet-001', 'card-001');
    expect(records).toHaveLength(2);
  });
});
