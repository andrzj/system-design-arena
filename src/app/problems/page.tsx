import ProblemList from '@/components/problems/ProblemList';
import { Footer } from '@/components/shared/footer';
import { getPublicProblems } from '@/lib/problems/queries';

export const dynamic = 'force-dynamic';

export default async function ProblemsPage() {
  const problems = await getPublicProblems();

  return (
    <>
      <ProblemList initialProblems={problems} />
      <Footer />
    </>
  );
}
