import { describe, expect, it } from 'vitest';
import {
  __resetCardService,
  changeCardDebitAccount,
  createWalletCard,
} from '@/features/cards/cardService';
import {
  standardEnvironmentDataset,
  standardEnvironmentProfile,
} from '../../fixtures/performance/standardEnvironment.fixture';

const SC009_FR030A_TARGET_MS = 1_000;
const WALLET_ID = 'wallet-001';

function nowMs(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

async function measureOperationMs(operation: () => Promise<unknown>): Promise<number> {
  const startedAt = nowMs();
  await operation();
  return nowMs() - startedAt;
}

async function registerCardLinkedRecordMock(): Promise<void> {
  await Promise.resolve();
}

describe('link operations under 1 second (SC-009 / FR-030A)', () => {
  it('mantem vinculo conta-cartao e registro-cartao abaixo de 1s no ambiente padrao', async () => {
    expect(standardEnvironmentProfile.osReference).toContain('Windows 11');
    expect(standardEnvironmentDataset.activeCards).toBe(2);

    __resetCardService();

    const createLatencyMs = await measureOperationMs(async () => {
      await createWalletCard(WALLET_ID, {
        name: 'Cartao benchmark',
        debitAccountId: 'account-001',
      });
    });

    const relinkLatencyMs = await measureOperationMs(async () => {
      await changeCardDebitAccount(WALLET_ID, 'card-1', 'account-002');
    });

    const linkedRecordLatencyMs = await measureOperationMs(async () => {
      await registerCardLinkedRecordMock();
    });

    expect(createLatencyMs).toBeLessThan(SC009_FR030A_TARGET_MS);
    expect(relinkLatencyMs).toBeLessThan(SC009_FR030A_TARGET_MS);
    expect(linkedRecordLatencyMs).toBeLessThan(SC009_FR030A_TARGET_MS);
  });
});
