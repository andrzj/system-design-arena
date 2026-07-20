import { expect, test } from '@playwright/test';

import {
  createConfirmedAuthUser,
  deleteAuthUser,
  deleteAuthUserByEmail,
  getProfileByEmail,
  prisma,
  probePublicSignUp,
  type E2EUser,
} from './helpers/auth-setup';

let publicSignUpWorks = false;
let signUpUserEmail: string | undefined;
let ensureProfileUser: E2EUser & { userId: string };

test.describe.serial('Phase 1 auth flow', () => {
  test.beforeAll(async () => {
    publicSignUpWorks = await probePublicSignUp();
  });

  test('unsigned user redirected from protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    expect(new URL(page.url()).searchParams.get('redirect_url')).toBe('/dashboard');
  });

  test('sign-up UI creates profile and session (Task 1.9 core)', async ({ page }) => {
    test.skip(!publicSignUpWorks, 'Public sign-up unavailable — set GOTRUE_MAILER_AUTOCONFIRM=true on auth service');

    const email = `e2e-signup-${Date.now()}@arena.test`;
    const name = 'E2E Sign Up User';
    signUpUserEmail = email;

    await page.goto('/auth/sign-up');
    await page.getByLabel('Name').fill(name);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('TestPass123!');
    await page.getByRole('button', { name: 'Create account' }).click();

    await page.waitForURL('**/problems', { timeout: 15_000 });
    await expect(page.getByRole('button', { name: /E2E Sign Up User/i })).toBeVisible({ timeout: 10_000 });

    await expect.poll(async () => getProfileByEmail(email)).not.toBeNull();
    const profile = await getProfileByEmail(email);
    expect(profile?.email).toBe(email);
    expect(profile?.name).toBe(name);
    expect(profile?.subscriptionTier).toBe('free');

    await page.goto('/dashboard');
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);

    await page.getByRole('button', { name: /E2E Sign Up User/i }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await page.waitForURL('**/');
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('sign-in creates profile when missing (ensureProfile)', async ({ page }) => {
    const created = await createConfirmedAuthUser('E2E Sign In User');
    if (!created.userId) throw new Error('Missing userId from admin create');
    ensureProfileUser = { ...created, userId: created.userId };

    expect(await getProfileByEmail(ensureProfileUser.email)).toBeNull();

    await page.goto('/auth/sign-in');
    await page.getByLabel('Email').fill(ensureProfileUser.email);
    await page.getByLabel('Password').fill(ensureProfileUser.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL('**/problems', { timeout: 15_000 });
    await expect(page.getByRole('button', { name: /E2E Sign In User/i })).toBeVisible({ timeout: 10_000 });

    await expect.poll(async () => getProfileByEmail(ensureProfileUser.email)).not.toBeNull();
    const profile = await getProfileByEmail(ensureProfileUser.email);
    expect(profile?.id).toBe(ensureProfileUser.userId);
    expect(profile?.subscriptionTier).toBe('free');
  });

  test.afterAll(async () => {
    if (signUpUserEmail) {
      await deleteAuthUserByEmail(signUpUserEmail);
    }
    if (ensureProfileUser?.userId) {
      await deleteAuthUser(ensureProfileUser.userId);
    }
    await prisma.$disconnect();
  });
});
