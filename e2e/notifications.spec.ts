import { expect, test } from '@playwright/test';

import { createConfirmedAuthUser, createProfileForE2EUser, deleteAuthUser } from './helpers/auth-setup';

test.describe('Phase 11 notifications', () => {
  test('F8 toggles notification panel when signed in', async ({ page }) => {
    const user = await createConfirmedAuthUser('Notify User');
    await createProfileForE2EUser(user, user.userId!);

    await page.goto('/auth/sign-in');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/(dashboard|problems)/, { timeout: 15_000 });

    await page.goto('/problems');
    await page.getByTestId('notifications-bell').click();
    await expect(page.getByText('No notifications yet.')).toBeVisible();

    await page.keyboard.press('F8');
    await expect(page.getByText('No notifications yet.')).not.toBeVisible();

    await deleteAuthUser(user.userId!);
  });
});
