import { describe, expect, it } from 'vitest';

import { buildConsensus, computeVerdict } from '@/lib/scoring/consensus';

describe('computeVerdict', () => {
  it('passes at 70+', () => {
    expect(computeVerdict(70)).toBe('pass');
    expect(computeVerdict(85)).toBe('pass');
  });

  it('borderline between 50-69', () => {
    expect(computeVerdict(50)).toBe('borderline');
    expect(computeVerdict(69)).toBe('borderline');
  });

  it('fails below 50', () => {
    expect(computeVerdict(49)).toBe('fail');
  });
});

describe('buildConsensus', () => {
  it('averages scores and builds feedback', () => {
    const result = buildConsensus(
      { score: 80, strengths: ['Good cache'], weaknesses: ['Missing CDN'], summary: 'Solid' },
      { score: 60, strengths: ['Simple ops'], weaknesses: ['Costly DB'], summary: 'OK' },
    );

    expect(result.averageScore).toBe(70);
    expect(result.verdict).toBe('pass');
    expect(result.writtenFeedback).toContain('Good cache');
  });
});
