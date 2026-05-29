export type StandardEnvironmentProfile = {
  osReference: string;
  runtime: string;
  hardware: string;
  networkLatencyMsMax: number;
};

export type StandardEnvironmentDataset = {
  activeAccounts: number;
  inactiveAccounts: number;
  activeCards: number;
  totalTransactions: number;
  cardExpenses: number;
  refunds: number;
};

export const standardEnvironmentProfile: StandardEnvironmentProfile = {
  osReference: 'Windows 11 23H2',
  runtime: 'Node.js 20 LTS + npm 10+',
  hardware: '4 vCPU / 8 GB RAM',
  networkLatencyMsMax: 20,
};

export const standardEnvironmentDataset: StandardEnvironmentDataset = {
  activeAccounts: 2,
  inactiveAccounts: 1,
  activeCards: 2,
  totalTransactions: 200,
  cardExpenses: 30,
  refunds: 10,
};

export function calculateP90FromRuns(runs: number[]): number {
  if (runs.length === 0) {
    return 0;
  }

  const ordered = [...runs].sort((left, right) => left - right);
  const index = Math.max(0, Math.ceil(ordered.length * 0.9) - 1);
  return ordered[index];
}

export function discardWarmupRuns(runs: number[], warmupCount = 5): number[] {
  return runs.slice(Math.max(0, warmupCount));
}
