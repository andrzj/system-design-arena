import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ReferenceArchitecture } from '@/components/problems/reference-architecture';
import { StartSessionButton } from '@/components/problems/start-session-button';
import { Footer } from '@/components/shared/footer';
import { difficultyBadgeClass, formatDifficulty } from '@/lib/marketing/difficulty';
import { formatProblemNumber, getPublicProblemBySlug, getRelatedArticles } from '@/lib/problems/queries';

function SectionBlock({ title, content }: { title: string; content: string }) {
  return (
    <section className="space-y-4">
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="rounded-xl border border-border/80 bg-card/40 p-6">
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{content}</p>
      </div>
    </section>
  );
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = await getPublicProblemBySlug(slug);

  if (!problem) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(problem.id);

  return (
    <>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm text-muted-foreground">{formatProblemNumber(problem.order)}</span>
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${difficultyBadgeClass(problem.difficulty)}`}
            >
              {formatDifficulty(problem.difficulty)}
            </span>
          </div>

          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight sm:text-5xl">
              {problem.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">{problem.brief}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border/80 bg-background/60 px-2.5 py-1 font-mono text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 space-y-10">
          <SectionBlock title="Requirements" content={problem.requirements} />
          <SectionBlock title="Key considerations" content={problem.keyConsiderations} />

          {relatedArticles.length > 0 ? (
            <section className="space-y-4">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-tight">
                Learn before solving
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {relatedArticles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/learn/${article.slug}`}
                      className="block rounded-xl border border-border/80 bg-card/40 p-4 transition-colors hover:border-primary/40 hover:bg-card/70"
                    >
                      <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                        {article.category.replace('-', ' ')}
                      </p>
                      <p className="mt-2 font-medium">{article.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.summary}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold tracking-tight">
              Reference architecture
            </h2>
            <ReferenceArchitecture data={problem.referenceArchitecture} />
          </section>

          <div className="flex flex-col gap-3 border-t border-border/60 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Opens a new design session on the blueprint canvas for this problem.
            </p>
            <StartSessionButton problemSlug={problem.slug} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
