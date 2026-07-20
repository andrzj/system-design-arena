import type { Prisma } from '@prisma/client';

export type ParsedReferenceArchitecture =
  | { kind: 'flow'; steps: string[] }
  | { kind: 'mermaid'; content: string }
  | { kind: 'text'; content: string };

export function parseReferenceArchitecture(
  data: Prisma.JsonValue | null,
): ParsedReferenceArchitecture | null {
  if (data == null) {
    return null;
  }

  if (typeof data === 'string') {
    const mermaidMatch = data.match(/```mermaid\n([\s\S]*?)```/);
    if (mermaidMatch) {
      return { kind: 'mermaid', content: mermaidMatch[1].trim() };
    }

    return { kind: 'text', content: data.trim() };
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    const record = data as Record<string, unknown>;

    if (record.type === 'flow' && Array.isArray(record.steps)) {
      return {
        kind: 'flow',
        steps: record.steps.filter((step): step is string => typeof step === 'string'),
      };
    }

    if (record.type === 'mermaid' && typeof record.content === 'string') {
      return { kind: 'mermaid', content: record.content };
    }

    if (record.type === 'text' && typeof record.content === 'string') {
      return { kind: 'text', content: record.content };
    }
  }

  return null;
}
