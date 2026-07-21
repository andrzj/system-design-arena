import { describe, expect, it } from 'vitest';

import { canvasToMermaid } from '@/lib/canvas/to-mermaid';

describe('canvasToMermaid', () => {
  it('generates flowchart from nodes and edges', () => {
    const result = canvasToMermaid(
      [
        {
          id: 'a',
          type: 'system',
          position: { x: 0, y: 0 },
          data: { label: 'Client', componentType: 'client', replicas: 1 },
        },
        {
          id: 'b',
          type: 'system',
          position: { x: 0, y: 0 },
          data: { label: 'Cache', componentType: 'cache', replicas: 1 },
        },
      ],
      [{ id: 'e1', source: 'a', target: 'b', type: 'smoothstep', data: { label: '', style: 'solid' } }],
    );

    expect(result).toContain('flowchart LR');
    expect(result).toContain('Client');
    expect(result).toContain('a --> b');
  });
});
