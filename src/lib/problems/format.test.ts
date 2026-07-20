import { describe, expect, it } from 'vitest';

import { formatProblemNumber } from '@/lib/problems/format';

describe('formatProblemNumber', () => {
  it('zero-pads order to three digits', () => {
    expect(formatProblemNumber(1)).toBe('#001');
    expect(formatProblemNumber(12)).toBe('#012');
    expect(formatProblemNumber(123)).toBe('#123');
  });
});
