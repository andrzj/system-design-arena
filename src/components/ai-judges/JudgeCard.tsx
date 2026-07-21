'use client';

type JudgeCardProps = {
  title: 'Rigor' | 'Pragmatism';
  score: number | null;
  summary?: string;
  loading?: boolean;
};

export function JudgeCard({ title, score, summary, loading }: JudgeCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{title} Judge</h4>
        {loading ? (
          <span className="text-xs text-muted-foreground">Scoring…</span>
        ) : score !== null ? (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-sm">{score}/100</span>
        ) : (
          <span className="text-xs text-muted-foreground">Upgrade for score</span>
        )}
      </div>
      {summary ? <p className="mt-2 text-sm text-muted-foreground">{summary}</p> : null}
    </div>
  );
}
