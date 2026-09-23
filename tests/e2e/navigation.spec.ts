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
  await expect(page.getByRole('button', { name: 'Új Cikk' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Kánonellenőrzés' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Források' })).toHaveCount(0);
});

test('story books appear at their historical anchor and can be skipped', async ({ page }) => {
  await page.goto('/#tab/story');
  const readingMode = page.getByLabel('Folyamatos történet olvasási módja');
  await expect(readingMode).toHaveValue('complete');
  await page.getByLabel('Történeti fejezet').selectOption('4');
  await expect(page.getByText(/Könyvszakasz: A Bűn Háborúja I/)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Itt következik: A Bűn Háborúja I/ })).toBeVisible();
  await expect(page.getByText(/történeti sorrendbe/)).toBeVisible();
  await expect(page.getByText('📖 Könyv', { exact: true })).toBeVisible();
  await expect(page.getByText('Mi történt eddig?')).toBeVisible();
  await page.getByRole('button', { name: /teljes könyv átugrása/i }).click();
  await expect(page.getByText(/Könyvszakasz: A Bűn Háborúja II/)).toBeVisible();
  await readingMode.selectOption('main');
  await expect(page.getByRole('button', { name: /teljes könyv átugrása/i })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Uldyssian ul-Diomed', exact: true })).toBeVisible();
  await expect(page.getByText('✦ Fő történet', { exact: true })).toBeVisible();
});

test('direct hash navigation restores the requested view', async ({ page }) => {
  await page.goto('/#tab/articles');
  await expect(page.locator('wiki-article-grid')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Fő navigáció' }).getByRole('button', { name: 'Cikkek' })).toHaveClass(/text-blood-red/);
});

test('universal search uses weighted fields, facets, suggestions and stable routes', async ({ page }) => {
  await page.goto('/#/search');
  await expect(page.getByRole('heading',{name:'Univerzális kereső'})).toBeVisible();
  const input=page.getByLabel('Univerzális keresőkifejezés');
  await input.fill('Tathamet');
  await expect(page.locator('wiki-search-page .result').first()).toContainText('Anu és Tathamet kozmikus háborúja');
  await page.getByLabel('Keresési tartalomtípus').selectOption('article');
  await input.fill('Ősprincípium');
  await expect(page.locator('wiki-search-page .result').first()).toContainText('Kozmogónia: Anu');
  await expect(page.getByRole('status')).toContainText(/találat/);
  await input.fill('Kozmgonia: Anu');
  await expect(page.getByText('Ezt kerested?')).toBeVisible();
  await page.getByRole('button',{name:'Kozmogónia: Anu'}).click();
  await expect(page.locator('wiki-search-page .result').first()).toContainText('Kozmogónia: Anu');
  await page.locator('wiki-search-page .result').first().click();
  await expect(page).toHaveURL(/#\/wiki\/kozmogonia$/);
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

test('Anu article uses an accessible responsive cosmology hero', async ({ page }) => {
  await page.goto('/#/wiki/kozmogonia');
  const hero = page.locator('wiki-article-view').locator('.article-hero');
  await expect(hero).toBeVisible();
  await expect(hero.locator('img')).toHaveAttribute('alt', /Anu fehér-arany kozmikus alakja/);
  await expect(hero.locator('.hero-title')).toContainText('Anu');
  await expect(hero.locator('.hero-title')).toHaveAccessibleName('Kozmogónia: Anu');
  await expect(hero.locator('figcaption')).toContainText('művészi ábrázolása');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
  await expect(hero.locator('img')).toBeVisible();
});

test('article page exposes breadcrumb, stable table of contents and quality summary', async ({ page }) => {
  await page.goto('/#/wiki/kozmogonia');
  const view=page.locator('wiki-article-view');
  await expect(view.getByRole('navigation',{name:'Morzsamenü'})).toContainText('Kozmogónia: Anu');
  const toc=view.getByRole('navigation',{name:'Tartalomjegyzék'});
  await expect(toc).toBeVisible();
  const firstLink=toc.getByRole('link').first();
  const target=(await firstLink.getAttribute('href'))?.slice(1);
  expect(target).toBeTruthy();
  await firstLink.click();
  await expect(view.locator(`#${target}`)).toBeVisible();
  await expect(view.getByLabel('Cikkminőség')).toContainText(/100|Közepes|Erős|Bővítendő/);
  await page.setViewportSize({width:390,height:844});
  await expect(toc).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
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

test('book reader remembers the exact position and supports manual bookmarks', async ({ page }) => {
  await page.goto('/#/books');
  const card = page.locator('book-library .card').filter({ has: page.getByRole('heading', { name: 'Az árnyak királysága', exact: true }) });
  await card.getByRole('button', { name: /Könyv olvasása|Olvasás folytatása/ }).click();
  await expect(page.locator('book-library .reader')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 1400));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(700);
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Könyvjelző ide' }).evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByRole('status')).toContainText('könyvjelzőt elmentettem');
  await page.goto('/#/books');
  const continuedCard = page.locator('book-library .card').filter({ has: page.getByRole('heading', { name: 'Az árnyak királysága', exact: true }) });
  await expect(continuedCard.getByRole('button', { name: 'Olvasás folytatása' })).toBeVisible();
  await continuedCard.getByRole('button', { name: 'Olvasás folytatása' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(700);
  await expect(page.getByRole('heading', { name: 'Könyvjelzők' })).toBeAttached();
});

test('library exposes reading status, statistics, personal backup and home continuation', async ({ page }) => {
  await page.goto('/#/books');
  const card = page.locator('book-library .card').filter({ has: page.getByRole('heading', { name: 'Az árnyak királysága', exact: true }) });
  await card.getByRole('button', { name: /Könyv olvasása|Olvasás folytatása/ }).click();
  await page.goto('/#/books');
  const savedCard = page.locator('book-library .card').filter({ has: page.getByRole('heading', { name: 'Az árnyak királysága', exact: true }) });
  await expect(savedCard.getByLabel('Az árnyak királysága olvasási állapota')).toHaveValue('reading');
  await savedCard.getByLabel('Az árnyak királysága olvasási állapota').selectOption('completed');
  await expect(page.getByLabel('Olvasási statisztika')).toContainText('1 befejezve');
  await page.getByLabel('Keresés a könyvtárban').fill('árnyak királysága');
  await expect(page.getByText('1 könyv látható.')).toBeVisible();
  await expect(page.locator('book-library .card')).toHaveCount(1);
  await expect(savedCard).toContainText(/kb\. \d+ perc/);
  await expect(savedCard.getByRole('progressbar')).toHaveJSProperty('value', 100);
  await page.getByLabel('Keresés a könyvtárban').fill('');
  await page.getByLabel('Könyvek szűrése olvasási állapot szerint').selectOption('completed');
  await expect(page.locator('book-library .card')).toHaveCount(1);
  await page.getByLabel('Könyvek rendezése').selectOption('recent');
  await expect(page.getByRole('button', { name: 'Teljes személyes mentés' })).toBeVisible();
  await expect(page.getByLabel('Személyes mentés visszaállítása')).toBeAttached();
  await page.goto('/#/wiki');
  await expect(page.locator('diablo-home .witcher-reading-label')).toHaveText('Folytasd innen');
  await expect(page.locator('diablo-home').getByRole('button', { name: /Olvasás folytatása/ })).toBeVisible();
});

test('book reader preferences persist and focus mode hides surrounding distractions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/books');
  const card = page.locator('book-library .card').filter({ has: page.getByRole('heading', { name: 'Az árnyak királysága', exact: true }) });
  await card.getByRole('button', { name: /Könyv olvasása|Olvasás folytatása/ }).click();
  await page.getByRole('button', { name: /Olvasási beállítások/ }).click();
  await page.getByLabel('Könyv olvasási témája').selectOption('parchment');
  await page.getByLabel('Könyv betűmérete').fill('1.2');
  const reader = page.locator('book-library .reader');
  await expect(reader).toHaveAttribute('data-theme', 'parchment', { timeout: 15_000 });
  await expect(reader).toHaveAttribute('style', /--reader-font-scale:1.2/, { timeout: 15_000 });
  await page.reload();
  await expect(reader).toHaveAttribute('data-theme', 'parchment', { timeout: 15_000 });
  await expect(reader).toHaveAttribute('style', /--reader-font-scale:1.2/, { timeout: 15_000 });
  await page.getByRole('button', { name: 'Zavaró elemek nélküli mód' }).click();
  await expect(reader).toHaveClass(/focus-mode/);
  await expect(page.getByRole('button', { name: /Kilépés az olvasómódból/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(reader).not.toHaveClass(/focus-mode/);
});

test('book reader supports e-ink mode and exports a portable EPUB on demand', async ({ page }) => {
  await page.goto('/#/books');
  const card = page.locator('book-library .card').filter({ has: page.getByRole('heading', { name: 'Az árnyak királysága', exact: true }) });
  await card.getByRole('button', { name: /Könyv olvasása|Olvasás folytatása/ }).click();
  await page.getByRole('button', { name: /Olvasási beállítások/ }).click();
  await page.getByLabel('Könyv olvasási témája').selectOption('eink');
  await expect(page.locator('book-library .reader')).toHaveAttribute('data-theme', 'eink');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'EPUB könyvolvasóra' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.epub$/u);
  await expect(page.getByRole('status')).toContainText('EPUB elkészült');
});

test('book reader searches every chapter and saves a note for selected text', async ({ page }) => {
  await page.goto('/#/books');
  const card = page.locator('book-library .card').filter({ has: page.getByRole('heading', { name: 'Az árnyak királysága', exact: true }) });
  await card.getByRole('button', { name: /Könyv olvasása|Olvasás folytatása/ }).click();
  const search = page.getByRole('searchbox', { name: 'Keresés a megnyitott könyvben' });
  await search.fill('Kentril');
  await expect(page.locator('book-library .search-results button').first()).toBeVisible();
  await expect(page.locator('book-library .search-results')).toContainText('találat');
  const paragraph = page.locator('book-library .chapter-content p').first();
  await paragraph.evaluate(element => {
    const selection = window.getSelection(); const range = document.createRange();
    range.selectNodeContents(element); selection?.removeAllRanges(); selection?.addRange(range);
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));
  });
  await expect(page.locator('book-library .selected-quote')).toBeVisible();
  await page.getByLabel('Saját olvasási jegyzet').fill('Fontos részlet a történetből.');
  await page.getByRole('button', { name: 'Jegyzet mentése' }).click();
  await expect(page.getByRole('status')).toContainText('jegyzetet elmentettem');
  await expect(page.getByRole('heading', { name: 'Könyvjelzők és jegyzetek' })).toBeVisible();
  await expect(page.getByText('Fontos részlet a történetből.')).toBeVisible();
});

test('the Blackmarch article is searchable and the removed importer stays unavailable', async ({ page }) => {
  await page.goto('/#tab/articles');
  const search = page.getByRole('searchbox', { name: 'Keresés a cikkek között' });
  await search.fill('Fekete Menetelés');
  await expect(page.getByText('A Fekete Menetelés (Blackmarch)', { exact: true })).toBeVisible();

  await expect(page.getByRole('button', { name: /új cikk/i })).toHaveCount(0);
  await page.goto('/#/editor');
  await expect(page.getByRole('heading', { name: 'Az oldal nem található' })).toBeVisible();
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

test('desktop sidebar reveals selected content immediately without manual scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/wiki');
  await page.evaluate(() => scrollTo(0, 900));
  await page.getByRole('complementary', { name: 'Diablo kódex' }).getByRole('button', { name: 'Angiris Tanács' }).click();
  await expect(page.locator('.codex-directory')).toBeVisible();
  await expect.poll(() => page.locator('.codex-directory').evaluate(element => Math.round(element.getBoundingClientRect().top))).toBeLessThan(180);
  await page.evaluate(() => scrollTo(0, 900));
  await page.getByRole('button', { name: 'Oldalsáv – teljes idővonal megnyitása' }).click();
  await expect(page.locator('diablo-timeline')).toBeVisible();
  await expect.poll(() => page.locator('.codex-content').evaluate(element => Math.round(element.getBoundingClientRect().top))).toBeLessThan(180);
});

test('Diablo and Witcher landings share the same responsive home layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/wiki');
  await expect(page.locator('diablo-home .witcher-hero')).toBeVisible();
  await expect(page.locator('diablo-home .witcher-hero-art')).toHaveAttribute('src', /diablo-hero-v3\.png/);
  await expect(page.locator('diablo-home .witcher-stats dd')).toHaveCount(4);
  await expect(page.locator('diablo-home .witcher-feature-card')).toHaveCount(3);
  await expect(page.getByLabel('Diablo gyorsnavigáció')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('diablo-home .witcher-hero')).toBeVisible();
  await expect(page.locator('diablo-home .witcher-hero h1')).toHaveText('Sanctuary kódexe');
  await expect(page.getByRole('searchbox', { name: 'Keresés a cikkek között' })).toBeVisible();
  await expect(page.locator('.codex-sidebar')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});

test('desktop Codex menus lead to populated content and the new home remains in-route', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/wiki');
  const sidebar = page.getByLabel('Diablo kódex');
  await expect(page.locator('diablo-home .witcher-home-section')).toHaveCount(3);
  await expect(page.getByLabel('Diablo gyorsnavigáció')).toBeVisible();
  await page.evaluate(() => scrollTo(0, 900));
  await sidebar.getByRole('button', { name: 'Sanctuary világa', exact: true }).click();
  await expect.poll(() => page.locator('.codex-directory').evaluate(element => Math.round(element.getBoundingClientRect().top))).toBeLessThan(180);
  for (const label of ['Univerzum', 'Sanctuary világa', 'Angiris Tanács', 'Nagy Konfliktus', 'Mennyek és Pokol', 'Lények', 'Démonok', 'Angyalok', 'Emberek', 'Helyszínek', 'Kehjistan', 'Scosglen', 'Egyéb helyszínek']) {
    await sidebar.getByRole('button', { name: label, exact: true }).click();
    await expect(page.locator('.directory-result-count'), `${label} menüpont`).not.toHaveText('0 cikk');
  }
  await sidebar.getByRole('button', { name: 'Események – idővonal megnyitása' }).click();
  await expect(page).toHaveURL(/#\/timeline$/);
  await sidebar.getByRole('button', { name: 'Oldalsáv – folyamatos olvasás megnyitása' }).click();
  await expect(page).toHaveURL(/#\/story$/);
  await sidebar.locator('button.sidebar-group-title', { hasText: 'Könyvtár' }).click();
  await expect(page).toHaveURL(/#\/books$/);
  await expect(sidebar.getByRole('button', { name: 'Oldalsáv – forrástár megnyitása' })).toHaveCount(0);
  await page.evaluate(() => scrollTo(0, 700));
  await page.getByLabel('Fő navigáció').getByRole('button', { name: 'Könyvek' }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5);
  await sidebar.getByRole('button', { name: /Véletlen cikk/ }).click();
  await expect(page).toHaveURL(/#\/wiki\/.+$/);
});

test('every Diablo home shortcut opens populated content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/wiki');
  await page.getByLabel('Diablo gyorsnavigáció').getByRole('button', { name: /Kronológia/ }).click();
  await expect(page).toHaveURL(/#\/timeline$/);
  await expect(page.locator('diablo-timeline')).toBeVisible();
  await page.goto('/#/wiki');
  await page.getByLabel('Diablo gyorsnavigáció').getByRole('button', { name: /Pokoli urak/ }).click();
  await expect(page.locator('wiki-article-view')).toBeVisible();
  await expect(page.locator('wiki-article-view').getByRole('heading').first()).toBeVisible();
});

test('all library cards open non-empty content and every visible control has a name', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/books');
  await expect(page.locator('book-library .card h2').first()).toBeVisible();
  const titles = await page.locator('book-library .card h2').allTextContents();
  expect(titles.length).toBeGreaterThan(0);
  for (const title of titles) {
    await page.goto('/#/books');
    const card = page.locator('book-library .card', { hasText: title });
    await card.getByRole('button').click();
    await expect(page.locator('book-library .reader')).toBeVisible();
    await expect.poll(() => page.locator('book-library .reader').evaluate(element => element.textContent?.trim().length ?? 0)).toBeGreaterThan(100);
  }
  for (const route of ['/#/wiki', '/#/timeline', '/#/story', '/#/books']) {
    await page.goto(route);
    const unnamed = await page.getByRole('button').evaluateAll(buttons => buttons.filter(button => !(button.getAttribute('aria-label') || button.textContent || '').trim()).length);
    expect(unnamed, `${route} névtelen gombjai`).toBe(0);
    const invalidLinks = await page.locator('a').evaluateAll(links => links.filter(link => {
      const href = link.getAttribute('href')?.trim() ?? '';
      return !href || /^javascript:/i.test(href);
    }).length);
    expect(invalidLinks, `${route} hibás hivatkozásai`).toBe(0);
  }
});

test('the 188-event chronology filters, reveals spoilers and supports timeline backlinks', async ({ page }) => {
  await page.goto('/#/timeline');
  await expect(page.getByText(/158 esemény/)).toBeVisible();
  for (const facet of ['Korszak','Szereplő','Helyszín','Játék','Frakció','Könyv','Kánon','Forrástípus']) await expect(page.getByLabel(facet,{exact:true})).toBeVisible();
  await page.getByLabel('Kánon',{exact:true}).selectOption('canon');
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.getByLabel('Kánon',{exact:true}).selectOption('');
  await page.getByLabel('Diablo IV és újabb történeti spoilerek megjelenítése').check();
  await expect(page.getByRole('heading', { name: '188. A kampány utáni jelenlegi kánonállapot' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kapcsolódó wiki-cikk megnyitása →' })).toHaveCount(185);
  await expect(page.getByRole('button', { name: 'Kapcsolódó könyv megnyitása →' })).toHaveCount(3);
  await page.getByPlaceholder(/Esemény, szereplő/).fill('Worldstone');
  await expect(page.getByText(/9 esemény/)).toBeVisible();
  await page.goto('/#/timeline/diablo-event-123');
  await expect(page.locator('#timeline-diablo-event-123')).toBeVisible();
  await page.goto('/#/wiki/kozmogonia');
  await expect(page.getByRole('heading',{name:'Kapcsolódó idővonalesemények'})).toBeVisible();
  await page.getByRole('button',{name:/001\. Anu/}).click();
  await expect(page).toHaveURL(/#\/timeline\/diablo-event-001$/);
});

test('hidden source library keeps audited sources works and claims available by direct route without mobile overflow',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/#/sources');await expect(page.getByRole('heading',{name:'Forrástár és műjegyzék'})).toBeVisible();await expect(page.getByRole('button',{name:/Források \(80\)/})).toBeVisible();await expect(page.getByText('Tyrael Hero Spotlight')).toBeVisible();await expect(page.getByText('Apotheosis',{exact:true})).toBeVisible();await page.getByRole('button',{name:/Művek \(85\)/}).click();await expect(page.getByRole('heading',{name:'Diablo III: Book of Cain'})).toBeVisible();await expect(page.getByText('gyűjtemény: Tales of Sanctuary').first()).toBeVisible();await expect(page.getByRole('heading',{name:'Heroes Rise, Darkness Falls'})).toBeVisible();await expect(page.getByRole('heading',{name:'Legends of the Necromancer: Rathma'})).toBeVisible();await expect(page.getByRole('heading',{name:'Diablo: Book of Prava'})).toBeVisible();await expect(page.getByRole('heading',{name:'The Lost Horadrim'})).toBeVisible();await page.getByRole('button',{name:/Ellenőrzött állítások \(42\)/}).click();await expect(page.getByText('Diablo II: Lord of Destruction után és Diablo III előtt')).toBeVisible();await expect(page.getByText('Worldstone',{exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);});

test('newly resolved local books have public metadata pages without full-text reproduction',async({page})=>{await page.goto('/#/wiki/the-lost-horadrim');await expect(page.getByRole('heading',{name:'The Lost Horadrim – Az elveszett Horadrim'})).toBeVisible();await expect(page.getByText(/Lord of Hatred.*előzményregény/).first()).toBeVisible();await page.goto('/#/wiki/stay-awhile-listen-book-1');await expect(page.getByRole('heading',{name:'Stay Awhile and Listen: Book I'})).toBeVisible();await expect(page.getByText(/nem Sanctuary világán belüli kánonmű/)).toBeVisible();});

test('A Gonosz ösvénye has one book at its Diablo I position and uses private chapters only locally', async ({ page }) => {
  await page.goto('/#/books');
  const localLibraryInstalled = await page.evaluate(async () => (await fetch('./private-library/articles.json')).ok);
  const card = page.locator('article.card').filter({ hasText: 'A Gonosz ösvénye' });
  await expect(card).toContainText(localLibraryInstalled ? '26 fejezet' : 'Ismertető és bibliográfia');
  await card.getByRole('button', { name: localLibraryInstalled ? 'Könyv olvasása' : 'Könyvadatlap megnyitása' }).click();
  await expect(page).toHaveURL(localLibraryInstalled ? /#\/book\/book-the-black-road-reader\/book-the-black-road-reader-ch01$/ : /#\/book\/book-the-black-road-reader$/);
  await expect(page.getByText(/Diablo I eseményei előtt kezdődik/)).toBeVisible();
  if (localLibraryInstalled) {
    await expect(page.getByRole('button', { name: '26. fejezet' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'A Gonosz ösvénye - 1. fejezet' })).toBeVisible();
  }
  await page.goto('/#/timeline');
  await page.getByLabel('Diablo IV és újabb történeti spoilerek megjelenítése').check();
  await page.getByPlaceholder(/Esemény, szereplő/).fill('A Gonosz ösvénye eseményei');
  await page.getByRole('button', { name: 'Kapcsolódó könyv megnyitása →' }).click();
  await expect(page).toHaveURL(localLibraryInstalled ? /#\/book\/book-the-black-road-reader\/book-the-black-road-reader-ch01$/ : /#\/book\/book-the-black-road-reader$/);
  await page.getByText('Részletes jogi információk').click();
  await expect(page.getByText(/nem a Lore Nexus szerkesztőjének szellemi tulajdona/)).toBeVisible();
});

test('install prompt exposes an accessible local-app install action', async ({ page }) => {
  await page.goto('/#/wiki');
  await expect(page.getByRole('button', { name: 'Lore Nexus – Wiki megnyitása' })).toBeVisible();
  await page.evaluate(() => {
    const installEvent = new Event('beforeinstallprompt', { cancelable: true });
    Object.defineProperties(installEvent, {
      prompt: { value: async () => undefined },
      userChoice: { value: Promise.resolve({ outcome: 'accepted', platform: 'web' }) },
    });
    window.dispatchEvent(installEvent);
  });
  const install = page.getByRole('button', { name: 'Lore Nexus telepítése erre az eszközre' });
  await expect(install).toBeVisible();
  await install.click();
  await expect(install).toBeHidden();
});

test('Witcher is a separate readable universe with its own navigation books and story', async ({ page }) => {
  await page.goto('/#/wiki');
  await page.getByLabel('Olvasott univerzum').selectOption('witcher');
  await expect(page).toHaveURL(/#\/u\/witcher\/timeline$/);
  await page.getByRole('button', { name: 'Cikkek' }).click();
  await expect(page.getByRole('heading', { name: 'A Kontinens krónikái' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Geralt egy holdfényes hegyvidéken/ })).toBeVisible();
  await expect.poll(() => page.getByRole('img', { name: /Geralt egy holdfényes hegyvidéken/ }).evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 1000)).toBe(true);
  await expect(page.locator('.witcher-feature-card').filter({ hasText: 'Ríviai Geralt' })).toBeVisible();
  await expect(page.locator('.witcher-gateway-list').getByRole('button', { name: /A Szférák Együttállása/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Olvasási sorrend megnyitása/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A Vaják Archívuma' })).toBeVisible();
  await expect(page.getByText('Ríviai Geralt', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Vaják archívum' })).toBeVisible();
  await page.locator('diablo-navigation').getByRole('button', { name: 'Könyvek' }).click();
  await expect(page.getByRole('heading', { name: 'Könyvek' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Az utolsó kívánság' })).toBeVisible();
  await page.locator('diablo-navigation').getByRole('button', { name: 'Történet' }).click();
  await expect(page.locator('story-reader')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});

  test('A tó úrnője exposes private chapters only when the local library is installed', async ({ page }) => {
    await page.goto('/#/u/witcher/book/witcher-book-lady-lake');
    await expect(page.getByRole('heading', { name: 'A tó úrnője', exact: true })).toBeVisible();
    await expect(page.getByText('A Vaják fősagájának hetedik, lezáró kötete.', { exact: false })).toBeVisible();
    const localLibraryInstalled = await page.evaluate(async () => (await fetch('./private-library/articles.json')).ok);
    await expect(page.getByRole('button', { name: /12\. fejezet/i })).toHaveCount(localLibraryInstalled ? 1 : 0);
  });

test('Witcher home remains readable and actionable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/u/witcher/wiki');
  await expect(page.getByRole('heading', { name: 'A Kontinens krónikái' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Geralt egy holdfényes hegyvidéken/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Történet olvasása/ })).toBeVisible();
  await expect(page.locator('.witcher-feature-card').filter({ hasText: 'Ríviai Geralt' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  await page.locator('.witcher-feature-card').filter({ hasText: 'Ríviai Geralt' }).click();
  await expect(page).toHaveURL(/#\/u\/witcher\/wiki\/witcher-geralt$/);
  await expect(page.getByRole('heading', { name: 'Ríviai Geralt' })).toBeVisible();
});
