import { expect, test } from '@playwright/test';

test.describe('Phase 8 learning library', () => {
  test('lists articles and opens article detail', async ({ page }) => {
    await page.goto('/learn');

    await expect(page.getByRole('heading', { name: 'Learning library' })).toBeVisible();
    await expect(page.getByRole('link').filter({ hasText: /Introduction|System Design|Database/i }).first()).toBeVisible();

    const firstArticle = page.getByRole('link').filter({ hasText: /Introduction|System Design|Database/i }).first();
    await firstArticle.click();
    await expect(page.getByRole('link', { name: 'Practice in Arena' })).toBeVisible();
  });
});
