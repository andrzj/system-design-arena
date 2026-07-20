import Link from 'next/link';
import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Full canvas practice with daily chaos sims and the complete article library.',
    features: [
      'Unlimited practice sessions',
      'All 44 canvas components',
      '1 chaos simulation per day',
      '27-article learning library',
      'All problems in the library',
    ],
    cta: { label: 'Get started', href: '/problems', variant: 'outline' as const },
    highlighted: false,
  },
  {
    name: 'Yearly',
    price: '$49',
    period: 'per year',
    description: 'Numeric AI scores, verdicts, and the Mermaid diagram editor.',
    features: [
      'Everything in Free',
      'AI scores from two judges',
      'Pass, fail, or borderline verdict',
      'Written feedback and consensus',
      'Mermaid diagram editor',
    ],
    cta: { label: 'Upgrade', href: '/auth/sign-up', variant: 'default' as const },
    highlighted: true,
  },
  {
    name: 'Stupid Button Club',
    price: 'Invite',
    period: 'via membership',
    description: 'Same premium features unlocked through the Stupid Button Club community.',
    features: [
      'Everything in Yearly',
      'Approved via member email',
      'Community membership perks',
      'Early access to new features',
    ],
    cta: { label: 'Learn about SBC', href: 'https://stupidbutton.club/', variant: 'outline' as const },
    highlighted: false,
  },
] as const;

export function PricingSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Practice for free. Upgrade when you want scored feedback and the Mermaid editor.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`flex flex-col rounded-xl border p-6 ${
                tier.highlighted
                  ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_rgb(59_130_246/0.15)]'
                  : 'border-border bg-card'
              }`}
            >
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-[family-name:var(--font-heading)] text-4xl font-semibold">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{tier.description}</p>
              </div>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={tier.cta.variant}
                className={`mt-8 w-full active:scale-[0.98] ${tier.highlighted ? '' : ''}`}
              >
                {tier.cta.href.startsWith('http') ? (
                  <a href={tier.cta.href} target="_blank" rel="noopener noreferrer">
                    {tier.cta.label}
                  </a>
                ) : (
                  <Link href={tier.cta.href}>{tier.cta.label}</Link>
                )}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
