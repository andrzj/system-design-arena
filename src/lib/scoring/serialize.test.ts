import { describe, expect, it } from 'vitest';

import { serializeArchitecture } from '@/lib/scoring/serialize';

describe('serializeArchitecture', () => {
  it('includes nodes, edges, and settings', () => {
    const text = serializeArchitecture({
      problemTitle: 'URL Shortener',
      requirements: 'Handle redirects',
      keyConsiderations: 'Hot reads',
      speedSetting: 1,
      trafficSetting: 2,
      readWriteRatio: 0.92,
      nodes: [{ label: 'Cache', componentType: 'cache', replicas: 2 }],
      edges: [{ source: 'client', target: 'cache' }],
    });

    expect(text).toContain('URL Shortener');
    expect(text).toContain('Cache');
    expect(text).toContain('client → cache');
  });
});
