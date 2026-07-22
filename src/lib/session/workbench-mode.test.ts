import { describe, expect, it } from 'vitest';
import {
  showComponentPalette,
  workbenchModeLabel,
  type WorkbenchMode,
} from './workbench-mode';

describe('workbench-mode', () => {
  it('shows palette only in design', () => {
    expect(showComponentPalette('design')).toBe(true);
    for (const mode of ['chaos', 'diagram', 'score'] as WorkbenchMode[]) {
      expect(showComponentPalette(mode)).toBe(false);
    }
  });

  it('maps labels for tabs', () => {
    expect(workbenchModeLabel('design')).toBe('Design');
    expect(workbenchModeLabel('chaos')).toBe('Chaos');
    expect(workbenchModeLabel('diagram')).toBe('Diagram');
    expect(workbenchModeLabel('score')).toBe('Score');
  });
});
