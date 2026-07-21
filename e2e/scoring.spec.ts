import { expect, test } from '@playwright/test';

import { createConfirmedAuthUser, createProfileForE2EUser, deleteAuthUser, prisma } from './helpers/auth-setup';

const URL_SHORTENER_SLUG = 'design-url-shortener';

test.describe('Phase 6 AI judging', () => {
  test('signed-in user can request qualitative score', async ({ page }) => {
    const created = await createConfirmedAuthUser('Judge Session User');
    await createProfileForE2EUser(created, created.userId!);

    await page.goto('/auth/sign-in');
    await page.getByLabel('Email').fill(created.email);
    await page.getByLabel('Password').fill(created.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/(dashboard|problems|session)/, { timeout: 15_000 });

    await page.goto(`/problems/${URL_SHORTENER_SLUG}`);
    await page.getByRole('button', { name: 'Start session' }).click();
    await page.waitForURL(/\/session\//);

    await page.getByTestId('add-component-client').click();
    await page.getByRole('tab', { name: 'Judges' }).click();
    await page.getByTestId('score-design').click();
    await expect(page.getByText(/## Strengths|Qualitative feedback/)).toBeVisible({ timeout: 15_000 });

    const sessionUuid = page.url().match(/\/session\/([^/?#]+)/)?.[1];
    if (sessionUuid) {
      await prisma.designSession.deleteMany({ where: { sessionUuid } });
    }
    await deleteAuthUser(created.userId!);
    await prisma.$disconnect();
  });
});
