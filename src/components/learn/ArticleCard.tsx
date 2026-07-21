import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Article } from '@prisma/client';

const CATEGORY_LABELS: Record<string, string> = {
  foundations: 'Foundations',
  'feeds-storage': 'Feeds & Storage',
  'realtime-geo': 'Realtime & Geo',
};

type ArticleCardProps = {
  article: Article;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="h-full transition-colors hover:border-primary/30">
      <CardHeader className="pb-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {CATEGORY_LABELS[article.category] ?? article.category}
        </p>
        <CardTitle className="text-base">
          <Link href={`/learn/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{article.summary}</p>
      </CardContent>
    </Card>
  );
}
