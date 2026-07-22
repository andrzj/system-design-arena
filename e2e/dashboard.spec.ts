import { expect, test } from '@playwright/test';

import { createConfirmedAuthUser, createProfileForE2EUser, deleteAuthUser } from './helpers/auth-setup';

test.describe('Phase 9 dashboard', () => {
  test('authenticated user sees dashboard stats', async ({ page }) => {
    const user = await createConfirmedAuthUser('Dashboard User');
    await createProfileForE2EUser(user, user.userId!);

    await page.goto('/auth/sign-in');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/(dashboard|problems)/, { timeout: 15_000 });

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Session History' })).toBeVisible();

    await deleteAuthUser(user.userId!);
  });
});
