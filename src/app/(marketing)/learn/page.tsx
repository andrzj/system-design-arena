import Link from 'next/link';

import { ArticleCard } from '@/components/learn/ArticleCard';
import { Input } from '@/components/ui/input';
import { getArticles } from '@/lib/db';

const CATEGORY_LABELS: Record<string, string> = {
  foundations: 'Foundations',
  'feeds-storage': 'Feeds & Storage',
  'realtime-geo': 'Realtime & Geo',
};

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const articles = await getArticles();
  const query = q?.trim().toLowerCase() ?? '';
  const filtered = query
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.summary.toLowerCase().includes(query) ||
          a.category.toLowerCase().includes(query),
      )
    : articles;

  const featured = filtered.filter((a) => a.featured).slice(0, 3);
  const categories = [...new Set(filtered.map((a) => a.category))];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold">Learning library</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Study core system design concepts, then practice in the arena.
      </p>

      <form className="mt-6 max-w-md" action="/learn" method="get">
        <Input name="q" placeholder="Search learning topics" aria-label="Search learning topics" defaultValue={q} />
      </form>

      {featured.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Featured</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {featured.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      ) : null}

      {categories.map((category) => {
        const items = filtered.filter((a) => a.category === category);
        return (
          <section key={category} className="mt-10">
            <h2 className="text-lg font-semibold">{CATEGORY_LABELS[category] ?? category}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {items.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        );
      })}

      <div className="mt-12 rounded-lg border border-border bg-card/40 p-6">
        <h2 className="font-semibold">Suggested path</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Start with Structure & Estimation</li>
          <li>Study the concept behind your chosen problem</li>
          <li>Run a session and compare AI score feedback</li>
        </ol>
        <Link href="/problems" className="mt-4 inline-block text-sm text-primary hover:underline">
          Practice in Arena →
        </Link>
      </div>
    </div>
  );
}
