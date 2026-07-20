import { expect, test } from '@playwright/test';

import { prisma } from './helpers/auth-setup';

const URL_SHORTENER_SLUG = 'design-url-shortener';

test.describe('Phase 4 canvas playground', () => {
  let createdSessionUuid: string | undefined;

  test('session page shows canvas tab and component palette', async ({ page }) => {
    await page.goto(`/problems/${URL_SHORTENER_SLUG}`);
    await page.getByRole('button', { name: 'Start session' }).click();
    await page.waitForURL(/\/session\/[a-z0-9]+/i, { timeout: 15_000 });

    const match = page.url().match(/\/session\/([^/?#]+)/);
    createdSessionUuid = match?.[1];

    await expect(page.getByRole('tab', { name: 'Canvas' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Chaos' })).toBeVisible();
    await expect(page.getByTestId('button-toggle-sim')).toBeVisible();
    await expect(page.getByPlaceholder('Search components')).toBeVisible();
    await expect(page.getByRole('slider', { name: 'Simulation speed' })).toBeVisible();
  });

  test('can add component from palette', async ({ page }) => {
    await page.goto(`/problems/${URL_SHORTENER_SLUG}`);
    await page.getByRole('button', { name: 'Start session' }).click();
    await page.waitForURL(/\/session\//);

    await page.getByTestId('add-component-client').click();
    await expect(page.locator('.react-flow__node-system').first()).toBeVisible();
  });

  test.afterAll(async () => {
    if (createdSessionUuid) {
      await prisma.designSession.deleteMany({ where: { sessionUuid: createdSessionUuid } });
    }
    await prisma.$disconnect();
  });
});
