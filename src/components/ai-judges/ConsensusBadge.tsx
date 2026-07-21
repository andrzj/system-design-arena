'use client';

type ConsensusBadgeProps = {
  verdict: 'pass' | 'borderline' | 'fail' | null;
};

const styles = {
  pass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  borderline: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  fail: 'border-red-500/40 bg-red-500/10 text-red-300',
};

export function ConsensusBadge({ verdict }: ConsensusBadgeProps) {
  if (!verdict) {
    return (
      <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
        Qualitative only
      </span>
    );
  }

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs capitalize ${styles[verdict]}`}>
      {verdict}
    </span>
  );
}
