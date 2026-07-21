export type ArchitectureNode = {
  label: string;
  componentType: string;
  replicas: number;
  implementationNotes?: string | null;
  isDisabled?: boolean;
};

export type ArchitectureEdge = {
  source: string;
  target: string;
  label?: string | null;
};

export type SessionArchitecture = {
  problemTitle: string;
  requirements: string;
  keyConsiderations: string;
  speedSetting: number;
  trafficSetting: number;
  readWriteRatio: number;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
};

export function serializeArchitecture(arch: SessionArchitecture): string {
  const nodeLines = arch.nodes.map(
    (n) =>
      `- ${n.label} (${n.componentType}) ×${n.replicas}${n.isDisabled ? ' [disabled]' : ''}${
        n.implementationNotes ? ` — notes: ${n.implementationNotes}` : ''
      }`,
  );
  const edgeLines = arch.edges.map((e) => `- ${e.source} → ${e.target}${e.label ? ` (${e.label})` : ''}`);

  return [
    `# Problem: ${arch.problemTitle}`,
    '',
    '## Requirements',
    arch.requirements,
    '',
    '## Key considerations',
    arch.keyConsiderations,
    '',
    '## Simulation settings',
    `- Speed: ${arch.speedSetting}×`,
    `- Traffic: ${arch.trafficSetting}×`,
    `- Read ratio: ${(arch.readWriteRatio * 100).toFixed(0)}%`,
    '',
    '## Architecture nodes',
    nodeLines.length ? nodeLines.join('\n') : '- (empty canvas)',
    '',
    '## Architecture edges',
    edgeLines.length ? edgeLines.join('\n') : '- (no connections)',
  ].join('\n');
}
