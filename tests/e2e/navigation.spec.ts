import { expect, test } from '@playwright/test';

test('application renders and switches its primary views', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('diablo-app')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kronológia' })).toBeVisible();
  await expect(page.locator('diablo-timeline')).toBeVisible();
  await page.getByRole('button', { name: 'Történet' }).click();
  await expect(page).toHaveURL(/#tab\/story$/);
  await expect(page.locator('story-reader')).toBeVisible();
  await expect(page.getByText(/pozíció automatikusan mentve/)).toBeVisible();
  await page.getByRole('button', { name: 'Cikkek' }).click();
  await expect(page).toHaveURL(/#tab\/articles$/);
  await expect(page.locator('wiki-article-grid')).toBeVisible();
  await page.getByRole('button', { name: 'Új Cikk' }).click();
  await expect(page).toHaveURL(/#tab\/editor$/);
  await expect(page.locator('wiki-editor')).toBeVisible();
  await page.getByRole('button', { name: 'Konfliktusok' }).click();
  await expect(page).toHaveURL(/#tab\/conflicts$/);
  await expect(page.locator('canon-conflict-dashboard')).toBeVisible();
  await expect(page.getByText('Nincs nyitott kánonkonfliktus.')).toBeVisible();
});

test('direct hash navigation restores the requested view', async ({ page }) => {
  await page.goto('/#tab/articles');
  await expect(page.locator('wiki-article-grid')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cikkek' })).toHaveClass(/text-blood-red/);
});
