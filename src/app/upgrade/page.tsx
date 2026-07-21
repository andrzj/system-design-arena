import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UpgradePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold">Upgrade</h1>
      <p className="mt-2 text-muted-foreground">
        Stripe checkout ships in Phase 10. Compare tiers below.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Canvas, 1 sim/day, qualitative AI feedback, all problems and articles.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Yearly — $49/yr</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            Numeric AI scores, verdict, Mermaid editor.
            <Button disabled className="w-full">
              Checkout (Phase 10)
            </Button>
          </CardContent>
        </Card>
      </div>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/problems">Back to problems</Link>
      </Button>
    </div>
  );
}
