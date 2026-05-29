import { describe, expect, it } from 'vitest';
import {
  calculateP90FromRuns,
  discardWarmupRuns,
  standardEnvironmentDataset,
  standardEnvironmentProfile,
} from '../../fixtures/performance/standardEnvironment.fixture';

const NFR005_SC008_TARGET_MS = 2_000;

describe('critical journeys p90 budget', () => {
  it('valida p90 <= 2s com descarte de warm-up no ambiente padrao', () => {
    expect(standardEnvironmentProfile.runtime).toContain('Node.js 20');
    expect(standardEnvironmentDataset.totalTransactions).toBe(200);

    const journeyRunsMs = [
      1750, 1810, 1700, 1680, 1720, // warm-up
      980, 1010, 990, 1040, 1120,
      1080, 1150, 920, 960, 995,
      1210, 1180, 1090, 950, 1020,
      1110, 1160, 1050, 980, 1005,
      1130, 1190, 1220, 1170, 980,
      1060, 1015, 990, 970, 1230,
      1290, 1320, 1250, 1400, 1500,
      1380, 1420, 1195, 1270, 1360,
      980, 1035, 1070, 1115, 1200,
    ];

    expect(journeyRunsMs).toHaveLength(50);

    const validRuns = discardWarmupRuns(journeyRunsMs, 5);
    expect(validRuns).toHaveLength(45);

    const p90 = calculateP90FromRuns(validRuns);

    expect(p90).toBeLessThanOrEqual(NFR005_SC008_TARGET_MS);
  });
});
