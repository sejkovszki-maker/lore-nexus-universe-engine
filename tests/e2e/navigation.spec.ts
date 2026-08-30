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
  await page.getByRole('button', { name: 'Kánonellenőrzés' }).click();
  await expect(page).toHaveURL(/#tab\/conflicts$/);
  await expect(page.locator('canon-conflict-dashboard')).toBeVisible();
  await expect(page.getByText('Nincs nyitott kánonkonfliktus.')).toBeVisible();
});

test('story books appear at their historical anchor and can be skipped', async ({ page }) => {
  await page.goto('/#tab/story');
  await expect(page.getByLabel('Könyvek beillesztése a történetbe')).toBeChecked();
  await page.getByLabel('Történeti fejezet').selectOption('4');
  await expect(page.getByText(/Könyvszakasz: A Bűn Háborúja I/)).toBeVisible();
  await page.getByRole('button', { name: /teljes könyv átugrása/i }).click();
  await expect(page.getByText(/Könyvszakasz: A Bűn Háborúja II/)).toBeVisible();
  await page.getByLabel('Könyvek beillesztése a történetbe').uncheck();
  await expect(page.getByRole('button', { name: /teljes könyv átugrása/i })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Uldyssian ul-Diomed', exact: true })).toBeVisible();
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

test('an imported book survives reload and invalid binary input is rejected', async ({ page }) => {
  await page.goto('/#tab/editor');
  await page.getByLabel('Idegen nyelvű könyv automatikus fordítása magyarra').uncheck();
  const chapterOne = 'Az első fejezet tartalma Sanctuary történetéről. '.repeat(10);
  const chapterTwo = 'A második fejezet tartalma a hősök útjáról. '.repeat(10);
  await page.getByLabel('Könyvdokumentum kiválasztása').setInputFiles({
    name: 'Utoteszt-konyv.txt', mimeType: 'text/plain',
    buffer: Buffer.from(`1. fejezet\n${chapterOne}\n\n2. fejezet\n${chapterTwo}`),
  });
  await page.getByRole('button', { name: /tartalom elemzése/i }).click();
  await expect(page.getByText(/2 fejezet felismerve/)).toBeVisible();
  const saved = page.waitForEvent('dialog').then(async dialog => {
    await dialog.accept();
  });
  await page.getByRole('button', { name: /teljes könyv integrálása/i }).click();
  await saved;
  await page.reload();
  await page.getByRole('button', { name: 'Cikkek' }).click();
  await page.getByPlaceholder(/keres/i).fill('Utoteszt konyv');
  await expect(page.getByText('Utoteszt konyv', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /új cikk/i }).click();
  await page.getByLabel('Könyvdokumentum kiválasztása').setInputFiles({
    name: 'nem-konyv.png', mimeType: 'image/png', buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]),
  });
  await expect(page.getByRole('alert')).toContainText('nem nyerhető ki könyvszöveg');
  await expect(page.locator('textarea')).toHaveValue('');
});

test('story reader remains usable without horizontal overflow on mobile and desktop', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/#tab/story');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByLabel('Történeti fejezet')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
