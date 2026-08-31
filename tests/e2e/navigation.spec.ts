import { expect, test } from '@playwright/test';

test('application renders and switches its primary views', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('diablo-app')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kronológia' })).toBeVisible();
  await expect(page.locator('diablo-timeline')).toBeVisible();
  await page.getByRole('button', { name: 'Történet' }).click();
  await expect(page).toHaveURL(/#\/story$/);
  await expect(page.locator('story-reader')).toBeVisible();
  await expect(page.getByText(/pozíció automatikusan mentve/)).toBeVisible();
  await page.getByRole('button', { name: 'Cikkek' }).click();
  await expect(page).toHaveURL(/#\/wiki$/);
  await expect(page.locator('wiki-article-grid')).toBeVisible();
  await page.getByRole('button', { name: 'Új Cikk' }).click();
  await expect(page).toHaveURL(/#\/editor$/);
  await expect(page.locator('wiki-editor')).toBeVisible();
  await page.getByRole('button', { name: 'Kánonellenőrzés' }).click();
  await expect(page).toHaveURL(/#\/conflicts$/);
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

test('Router 2.0 supports article deep links, history, 404 and scroll restoration', async ({ page }) => {
  await page.goto('/#/wiki/kozmogonia');
  await expect(page.getByRole('heading', { name: 'Kozmogónia: Anu', exact: true })).toBeVisible();
  await page.evaluate(() => { location.hash = '#/wiki/horadrim-order'; });
  await expect(page.getByRole('heading', { name: /Horadrim Rend/i }).first()).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Kozmogónia: Anu', exact: true })).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/#\/wiki\/horadrim-order$/);

  await page.goto('/#/wiki');
  await page.evaluate(() => scrollTo(0, 600));
  await page.evaluate(() => { location.hash = '#/wiki/kozmogonia'; });
  await page.goBack();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);

  await page.goto('/#/wiki/nem-letezik');
  await expect(page.getByRole('heading', { name: 'Az oldal nem található' })).toBeVisible();
  await page.goto('/#/u/witcher/wiki/kozmogonia');
  await expect(page.getByRole('heading', { name: 'Az oldal nem található' })).toBeVisible();
});

test('books have a separate reader and stable deep links', async ({ page }) => {
  await page.goto('/#/books');
  await expect(page.getByRole('heading', { name: 'Könyvek' })).toBeVisible();
  await page.getByRole('button', { name: 'Könyv olvasása' }).first().click();
  await expect(page).toHaveURL(/#\/book\//);
  await expect(page.getByRole('navigation', { name: 'Könyv lapozása' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('navigation', { name: 'Könyv lapozása' })).toBeVisible();
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
  let saveMessage = '';
  const saved = page.waitForEvent('dialog').then(async dialog => {
    saveMessage = dialog.message();
    await dialog.accept();
  });
  await page.getByRole('button', { name: /teljes könyv integrálása/i }).click();
  await saved;
  expect(saveMessage).toContain('tartósan mentve');
  await page.reload();
  await page.getByRole('button', { name: 'Könyvek' }).click();
  await expect(page.getByText('Utoteszt konyv', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /új cikk/i }).click();
  await page.getByLabel('Könyvdokumentum kiválasztása').setInputFiles({
    name: 'nem-konyv.png', mimeType: 'image/png', buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]),
  });
  await expect(page.getByRole('alert')).toContainText('nem nyerhető ki könyvszöveg');
  await expect(page.locator('textarea')).toHaveValue('');
});

test('foreign books create an isolated universe tab and remain readable in story order', async ({ page }) => {
  await page.goto('/#/editor');
  await page.getByLabel('Idegen nyelvű könyv automatikus fordítása magyarra').uncheck();
  await page.getByLabel('Könyvdokumentum kiválasztása').setInputFiles({ name: 'Vajak-proba.txt', mimeType: 'text/plain', buffer: Buffer.from(`1. fejezet\n${'Geralt, a witcher Yennefer és Ciri nyomába indult Nilfgaard felé. '.repeat(10)}\n\n2. fejezet\n${'A vaják újabb szörnyeteggel találkozott. '.repeat(12)}`) });
  await page.getByRole('button', { name: /tartalom elemzése/i }).click();
  await expect(page.getByText(/Felismert univerzum: The Witcher/)).toBeVisible();
  let saveMessage = '';
  const saved = page.waitForEvent('dialog').then(dialog => { saveMessage = dialog.message(); return dialog.accept(); });
  await page.getByRole('button', { name: /teljes könyv integrálása/i }).click();
  await saved;
  expect(saveMessage).toContain('The Witcher');
  await page.getByLabel('Olvasott univerzum').selectOption('witcher');
  await expect(page).toHaveURL(/#\/u\/witcher\/timeline$/);
  await page.getByRole('button', { name: 'Könyvek' }).click();
  await expect(page.getByText('Vajak proba', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Történet' }).click();
  await expect(page.getByText(/Könyvszakasz: Vajak proba/)).toBeVisible();
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

test('the 184-event chronology filters, reveals spoilers and supports timeline backlinks', async ({ page }) => {
  await page.goto('/#/timeline');
  await expect(page.getByText(/155 esemény/)).toBeVisible();
  await page.getByLabel('Diablo IV és újabb történeti spoilerek megjelenítése').check();
  await expect(page.getByRole('heading', { name: '184. A kampány utáni jelenlegi kánonállapot' })).toBeVisible();
  await page.getByPlaceholder(/Esemény, szereplő/).fill('Worldstone');
  await expect(page.getByText(/9 esemény/)).toBeVisible();
  await page.goto('/#/timeline/diablo-event-123');
  await expect(page.locator('#timeline-diablo-event-123')).toBeVisible();
  await page.goto('/#/wiki/kozmogonia');
  await expect(page.getByRole('heading',{name:'Kapcsolódó idővonalesemények'})).toBeVisible();
  await page.getByRole('button',{name:/001\. Anu/}).click();
  await expect(page).toHaveURL(/#\/timeline\/diablo-event-001$/);
});

test('source library exposes audited sources works and claims without mobile overflow',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/#/sources');await expect(page.getByRole('heading',{name:'Forrástár és műjegyzék'})).toBeVisible();await expect(page.getByRole('button',{name:/Források \(33\)/})).toBeVisible();await page.getByRole('button',{name:/Művek \(39\)/}).click();await expect(page.getByRole('heading',{name:'Diablo III: Book of Cain'})).toBeVisible();await expect(page.getByText('gyűjtemény: Tales of Sanctuary').first()).toBeVisible();await page.getByRole('button',{name:/Ellenőrzött állítások \(14\)/}).click();await expect(page.getByText('Diablo II: Lord of Destruction után és Diablo III előtt')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);});
