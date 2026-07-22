export type QuickChaosEvent = {
  eventId: string;
  emoji: string;
  label: string;
};

export const QUICK_CHAOS_EVENTS: QuickChaosEvent[] = [
  { eventId: 'thread_exhaustion', emoji: '📈', label: 'CPU Spike' },
  { eventId: 'network_partition', emoji: '✂️', label: 'Network Partition' },
  { eventId: 'high_latency', emoji: '🕰️', label: 'High Latency' },
  { eventId: 'packet_loss', emoji: '🔁', label: 'Connection Flap' },
  { eventId: 'server_crash', emoji: '💥', label: 'Instance Crash' },
  { eventId: 'cache_thundering_herd', emoji: '🐃', label: 'Cache Stampede' },
  { eventId: 'ddos_attack', emoji: '🌊', label: 'Traffic Surge' },
];
