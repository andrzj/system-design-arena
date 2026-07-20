import type { Prisma } from '@prisma/client';
import { ArrowRight } from 'lucide-react';

import { parseReferenceArchitecture } from '@/lib/problems/reference-architecture';

interface ReferenceArchitectureProps {
  data: Prisma.JsonValue | null;
}

export function ReferenceArchitecture({ data }: ReferenceArchitectureProps) {
  const parsed = parseReferenceArchitecture(data);

  if (!parsed) {
    return (
      <p className="text-sm text-muted-foreground">
        Reference architecture will appear here once this problem is fully seeded.
      </p>
    );
  }

  if (parsed.kind === 'flow') {
    return (
      <ol className="space-y-3">
        {parsed.steps.map((step, index) => (
          <li
            key={`${index}-${step}`}
            className="flex items-start gap-3 rounded-lg border border-border/80 bg-card/40 px-4 py-3"
          >
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs text-primary">
              {index + 1}
            </span>
            <span className="font-mono text-sm leading-relaxed text-foreground/90">{step}</span>
          </li>
        ))}
      </ol>
    );
  }

  if (parsed.kind === 'mermaid') {
    return (
      <div className="overflow-x-auto rounded-xl border border-border/80 bg-background/60 p-4">
        <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowRight className="size-3.5" strokeWidth={1.75} />
          Mermaid diagram preview (interactive editor in premium tier)
        </p>
        <pre className="font-mono text-xs leading-relaxed text-foreground/90">{parsed.content}</pre>
      </div>
    );
  }

  return (
    <pre className="overflow-x-auto rounded-xl border border-border/80 bg-background/60 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
      {parsed.content}
    </pre>
  );
}
