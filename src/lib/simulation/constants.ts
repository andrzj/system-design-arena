/** Reference playground baseline inbound RPS at traffic multiplier 1. */
export const BASE_RPS = 1200;

export const DEFAULT_CACHE_HIT_RATE = 0.8;
export const DEFAULT_EDGE_CACHE_HIT_RATE = 0.9;
export const DEFAULT_TELEMETRY_SAMPLE_RATE = 0.02;
export const DEFAULT_CONTROL_SAMPLE_RATE = 0.005;
export const DEFAULT_KEY_SKEW_PCT = 10;

export const PARTITION_STRATEGY_FACTORS = {
  hash: 1,
  range: 0.9,
  round_robin: 0.95,
  geo: 0.85,
} as const;

export type PartitionStrategy = keyof typeof PARTITION_STRATEGY_FACTORS;
