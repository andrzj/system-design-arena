import { describe, expect, it } from 'vitest';

import { isValidConnection } from '@/lib/canvas/validation';

describe('isValidConnection', () => {
  it('allows source to target handles', () => {
    expect(
      isValidConnection({
        source: 'a',
        target: 'b',
        sourceHandle: 'source',
        targetHandle: 'target',
      }),
    ).toBe(true);
  });

  it('rejects self connections', () => {
    expect(
      isValidConnection({
        source: 'a',
        target: 'a',
        sourceHandle: 'source',
        targetHandle: 'target',
      }),
    ).toBe(false);
  });

  it('rejects wrong handle directions', () => {
    expect(
      isValidConnection({
        source: 'a',
        target: 'b',
        sourceHandle: 'target',
        targetHandle: 'source',
      }),
    ).toBe(false);
  });
});
