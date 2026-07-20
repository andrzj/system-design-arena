import { describe, expect, it } from 'vitest';

import { parseReferenceArchitecture } from '@/lib/problems/reference-architecture';

describe('parseReferenceArchitecture', () => {
  it('extracts mermaid from markdown string', () => {
    const result = parseReferenceArchitecture('```mermaid\ngraph TD\n  A --> B\n```');

    expect(result).toEqual({
      kind: 'mermaid',
      content: 'graph TD\n  A --> B',
    });
  });

  it('parses flow json', () => {
    const result = parseReferenceArchitecture({
      type: 'flow',
      steps: ['Client → Load Balancer', 'Load Balancer → App Server'],
    });

    expect(result).toEqual({
      kind: 'flow',
      steps: ['Client → Load Balancer', 'Load Balancer → App Server'],
    });
  });

  it('returns null for unsupported json', () => {
    expect(parseReferenceArchitecture({ foo: 'bar' })).toBeNull();
  });

  it('parses plain text strings', () => {
    expect(parseReferenceArchitecture('Client → Load Balancer → App Server')).toEqual({
      kind: 'text',
      content: 'Client → Load Balancer → App Server',
    });
  });

  it('parses mermaid json objects', () => {
    expect(parseReferenceArchitecture({ type: 'mermaid', content: 'graph TD\nA-->B' })).toEqual({
      kind: 'mermaid',
      content: 'graph TD\nA-->B',
    });
  });

  it('returns null for null input', () => {
    expect(parseReferenceArchitecture(null)).toBeNull();
  });
});
