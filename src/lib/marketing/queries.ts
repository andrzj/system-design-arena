import prisma from '@/lib/prisma/client';

export async function getFeaturedProblems(limit = 4) {
  return prisma.problem.findMany({
    where: { isPublic: true },
    orderBy: { order: 'asc' },
    take: limit,
  });
}

export async function getFeaturedArticles(limit = 3) {
  return prisma.article.findMany({
    where: { isPublished: true, featured: true },
    orderBy: { order: 'asc' },
    take: limit,
  });
}
