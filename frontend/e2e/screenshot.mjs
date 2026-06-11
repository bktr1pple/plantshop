// Разовий хелпер для ручної візуальної перевірки: знімає сторінки локального
// дев-сервера в обох темах. Використання: node e2e/screenshot.mjs [shotDir]
import { chromium } from '@playwright/test';

const BASE = process.env.SHOT_BASE_URL || 'http://localhost:3000';
const outDir = process.argv[2] || 'shots';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.addInitScript(() => {
  localStorage.setItem('theme', 'light');
});
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

// Плавний прохід сторінкою, щоб whileInView-секції відкрилися
for (let i = 1; i <= 6; i++) {
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(450);
}

await page.evaluate(() => {
  document.querySelector('#featured-plants-title')?.scrollIntoView({ block: 'start' });
});
await page.waitForTimeout(800);
await page.screenshot({ path: `${outDir}/home-featured.png` });
console.log('saved home-featured');

await page.evaluate(() => {
  const headings = [...document.querySelectorAll('h2')];
  headings
    .find((h) => h.textContent?.includes('Де найкраще'))
    ?.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(800);
await page.screenshot({ path: `${outDir}/home-directions.png` });
console.log('saved home-directions');

await browser.close();
