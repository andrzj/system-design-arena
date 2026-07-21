import { expect, test } from '@playwright/test';

import { prisma } from './helpers/auth-setup';

const URL_SHORTENER_SLUG = 'design-url-shortener';

test.describe('Phase 5 chaos engineering', () => {
  let sessionUuid: string | undefined;

  test('chaos tab lists events and runs simulation', async ({ page }) => {
    await page.goto(`/problems/${URL_SHORTENER_SLUG}`);
    await page.getByRole('button', { name: 'Start session' }).click();
    await page.waitForURL(/\/session\//);
    sessionUuid = page.url().match(/\/session\/([^/?#]+)/)?.[1];

    await page.getByTestId('add-component-client').click();
    await page.getByRole('tab', { name: 'Chaos' }).click();
    await expect(page.getByTestId('chaos-event-server_crash')).toBeVisible();
    await page.getByTestId('chaos-event-server_crash').click();
    await page.locator('select').selectOption({ index: 1 });
    await page.getByTestId('start-chaos-simulation').click();
    await expect(page.getByLabel('Chaos event timeline').locator('li').first()).toBeVisible();
  });

  test.afterAll(async () => {
    if (sessionUuid) {
      await prisma.designSession.deleteMany({ where: { sessionUuid } });
    }
    await prisma.$disconnect();
  });
});
