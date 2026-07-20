import { prisma } from '@/lib/prisma/client';

export async function createProfileForUser(
  userId: string,
  email?: string | null,
  name?: string | null,
) {
  return prisma.profile.create({
    data: {
      id: userId,
      email: email ?? null,
      name: name ?? null,
      subscriptionTier: 'free',
    },
  });
}

export async function ensureProfile(userId: string, email?: string | null, name?: string | null) {
  const existing = await prisma.profile.findUnique({
    where: { id: userId },
  });

  if (existing) return existing;

  return createProfileForUser(userId, email, name);
}
