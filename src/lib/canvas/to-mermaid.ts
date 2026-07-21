import type { RFEdge, RFNode } from '@/store/canvas-store';

export function canvasToMermaid(nodes: RFNode[], edges: RFEdge[]): string {
  if (nodes.length === 0) {
    return 'flowchart LR\n  empty[Add components to generate diagram]';
  }

  const sanitize = (value: string) => value.replace(/[^a-zA-Z0-9_]/g, '_');

  const lines = ['flowchart LR'];
  for (const node of nodes) {
    const id = sanitize(node.id);
    lines.push(`  ${id}["${node.data.label}"]`);
  }
  for (const edge of edges) {
    lines.push(`  ${sanitize(edge.source)} --> ${sanitize(edge.target)}`);
  }
  return lines.join('\n');
}
