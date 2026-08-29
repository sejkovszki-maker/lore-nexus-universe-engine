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

test('the Blackmarch article is searchable and book import is available', async ({ page }) => {
  await page.goto('/#tab/articles');
  const search = page.getByPlaceholder(/keres/i);
  await search.fill('Fekete Menetelés');
  await expect(page.getByText('A Fekete Menetelés (Blackmarch)', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /új cikk/i }).click();
  await expect(page.getByLabel('Könyvdokumentum kiválasztása')).toBeVisible();
  await page.getByLabel('Könyvdokumentum kiválasztása').setInputFiles({
    name: 'proba-konyv.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('1. fejezet\nA Fekete Menetelés története.\n\n2. fejezet\nA történet folytatódik.'),
  });
  await expect(page.getByRole('status')).toContainText('proba-konyv.txt');
  await expect(page.locator('textarea')).toHaveValue(/A Fekete Menetelés története\./);
});
