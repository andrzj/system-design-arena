import { getProblemBySlug } from '@/lib/db';
import type { Problem } from '@prisma/client';


import { notFound } from 'next/navigation';

async function fetchProblem(slug: string): Promise<Problem | null> {
  return getProblemBySlug(slug);
}

export default async function ProblemPage({ params }: { params: { slug: string } }) {
  const problem = await fetchProblem(params.slug);
  if (!problem) {
    notFound();
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
      <div className="flex items-center mb-2">
        <span className={`px-2 py-1 text-xs rounded ${problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' : problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
        >
          {problem.difficulty}
        </span>
        <span className="ml-4 text-sm text-muted-foreground">
          {problem.tags.join(', ')}
        </span>
      </div>
      <p className="mb-6">{problem.brief}</p>
      <h2 className="text-2xl font-semibold mb-2">Requirements</h2>
      <p className="whitespace-pre-line">{problem.requirements}</p>
      <h2 className="text-2xl font-semibold mb-2 mt-6">Key Considerations</h2>
      <p className="whitespace-pre-line">{problem.keyConsiderations}</p>
      <a
        href={`/session/create?problemId=${problem.id}`}
        className="inline-block mt-8 px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Start Session
      </a>
    </div>
  );
}
