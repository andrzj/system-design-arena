import prisma from '@/lib/prisma/client';

export { formatProblemNumber } from '@/lib/problems/format';

export async function getPublicProblems() {
  return prisma.problem.findMany({
    where: { isPublic: true },
    orderBy: { order: 'asc' },
  });
}

export async function getPublicProblemBySlug(slug: string) {
  return prisma.problem.findFirst({
    where: { slug, isPublic: true },
  });
}

export async function getRelatedArticles(problemId: number, limit = 6) {
  return prisma.article.findMany({
    where: {
      isPublished: true,
      relatedProblemIds: { has: problemId },
    },
    orderBy: { order: 'asc' },
    take: limit,
  });
}