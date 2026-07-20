const difficultyStyles: Record<string, string> = {
  easy: 'bg-success/15 text-success',
  medium: 'bg-amber-500/15 text-amber-400',
  hard: 'bg-destructive/15 text-destructive',
};

export function difficultyBadgeClass(difficulty: string) {
  return difficultyStyles[difficulty] ?? 'bg-muted text-muted-foreground';
}

export function formatDifficulty(difficulty: string) {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}
