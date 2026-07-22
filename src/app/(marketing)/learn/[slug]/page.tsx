import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArticleContent } from '@/components/learn/ArticleContent';
import { Button } from '@/components/ui/button';
import { getArticleBySlug, getProblems } from '@/lib/db';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || !article.isPublished) {
    notFound();
  }

  const problems = await getProblems();
  const related = problems.filter((p) => article.relatedProblemIds.includes(p.id));

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{article.category}</p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold">{article.title}</h1>
      <p className="mt-3 text-muted-foreground">{article.summary}</p>
      <ArticleContent content={article.content} />

      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Related problems</h2>
          <ul className="mt-3 space-y-2">
            {related.map((problem) => (
              <li key={problem.id}>
                <Link href={`/problems/${problem.slug}`} className="text-primary hover:underline">
                  {problem.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Button asChild className="mt-8">
        <Link href="/problems">Practice in Arena</Link>
      </Button>
    </article>
  );
}
