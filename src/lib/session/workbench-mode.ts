export type WorkbenchMode = 'design' | 'chaos' | 'diagram' | 'score';

export function showComponentPalette(mode: WorkbenchMode): boolean {
  return mode === 'design';
}

export function workbenchModeLabel(mode: WorkbenchMode): string {
  switch (mode) {
    case 'design':
      return 'Design';
    case 'chaos':
      return 'Chaos';
    case 'diagram':
      return 'Diagram';
    case 'score':
      return 'Score';
  }
}
