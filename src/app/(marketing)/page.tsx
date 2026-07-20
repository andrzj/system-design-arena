import { FinalCtaSection } from '@/components/marketing/final-cta-section';
import { HeroSection } from '@/components/marketing/hero-section';
import { HowItWorksSection } from '@/components/marketing/how-it-works-section';
import { LearnCalloutSection } from '@/components/marketing/learn-callout-section';
import { PricingSection } from '@/components/marketing/pricing-section';
import { ProblemPreviewSection } from '@/components/marketing/problem-preview-section';
import { Footer } from '@/components/shared/footer';
import { getFeaturedArticles, getFeaturedProblems } from '@/lib/marketing/queries';

export default async function HomePage() {
  const [problems, articles] = await Promise.all([getFeaturedProblems(), getFeaturedArticles()]);

  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <ProblemPreviewSection problems={problems} />
      <LearnCalloutSection articles={articles} />
      <PricingSection />
      <FinalCtaSection />
      <Footer />
    </>
  );
}
