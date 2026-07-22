import { expect, test } from '@playwright/test';

import { prisma } from './helpers/auth-setup';

const URL_SHORTENER_SLUG = 'design-url-shortener';

test.describe('Phase 3 problem library', () => {
  let createdSessionUuid: string | undefined;

  test('lists public problems with filters and search', async ({ page }) => {
    await page.goto('/problems');

    await expect(page.getByRole('heading', { name: 'Problem library' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Attempt' }).first()).toBeVisible();

    await page.getByRole('tab', { name: 'Easy' }).click();
    await expect(page.getByRole('heading', { name: 'Design a URL Shortener' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Design a Distributed Cache' })).not.toBeVisible();

    await page.getByRole('searchbox', { name: 'Search problems' }).fill('url shortener');
    await expect(page.getByRole('heading', { name: 'Design a URL Shortener' })).toBeVisible();
  });

  test('problem brief shows requirements and related content', async ({ page }) => {
    await page.goto(`/problems/${URL_SHORTENER_SLUG}`);

    await expect(page.getByRole('heading', { name: 'Design a URL Shortener' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Requirements' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Key considerations' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reference architecture' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start session' })).toBeVisible();
  });

  test('start session creates design session and redirects', async ({ page }) => {
    await page.goto(`/problems/${URL_SHORTENER_SLUG}`);
    await page.getByRole('button', { name: 'Start session' }).click();

    await page.waitForURL(/\/session\/[a-z0-9]+/i, { timeout: 15_000 });
    const match = page.url().match(/\/session\/([^/?#]+)/);
    expect(match?.[1]).toBeTruthy();
    createdSessionUuid = match![1];

    await expect(page.getByRole('heading', { name: 'Design a URL Shortener' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Design' })).toBeVisible();

    await expect.poll(async () =>
      prisma.designSession.findUnique({ where: { sessionUuid: createdSessionUuid! } }),
    ).not.toBeNull();
  });

  test.afterAll(async () => {
    if (createdSessionUuid) {
      await prisma.designSession.deleteMany({ where: { sessionUuid: createdSessionUuid } });
    }
    await prisma.$disconnect();
  });
});
