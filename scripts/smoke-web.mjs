// Smoke test: serves the exported web build (`npx expo export -p web`) and taps through
// every tab and detail screen like a user would, failing on any uncaught page error.
// Usage: npm run smoke
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = new URL('../dist/', import.meta.url).pathname;
if (!existsSync(join(root, 'index.html'))) {
  console.error('dist/ not found. Run `npx expo export -p web` first.');
  process.exit(1);
}

const types = { '.js': 'text/javascript', '.html': 'text/html', '.png': 'image/png', '.ttf': 'font/ttf', '.json': 'application/json', '.ico': 'image/x-icon' };
const server = createServer((req, res) => {
  let file = join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html');
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
page.on('pageerror', (e) => errors.push(e.message));

const settle = () => page.waitForTimeout(1200);
const step = async (name, fn) => {
  const before = errors.length;
  try {
    await fn();
    await settle();
  } catch (e) {
    errors.push(`${name}: ${e.message.split('\n').slice(0, 12).join(' | ')}`);
  }
  console.log(`${errors.length === before ? '✓' : '✗'} ${name}`);
};
// Inactive tab screens stay mounted (hidden), so only match visible elements.
const visibleText = (text, exact = true) => page.getByText(text, { exact }).locator('visible=true').first();
// Stacked screens can overlap, so prefer accessibility roles and the topmost match.
const button = (name) => page.getByRole('button', { name, exact: typeof name === 'string' }).locator('visible=true').last();
const tab = (name) => page.getByRole('tab', { name, exact: true }).click();
const back = () => page.goBack();

await page.goto(`${base}/?nosplash`);
await settle();

await step('tab: Log', () => tab('Log'));
await step('tab: History', () => tab('History'));
await step('tab: Stats', () => tab('Stats'));
await step('stats: range toggle', () => visibleText('All').click());
await step('tab: Home', () => tab('Home'));
await step('open muscle detail', () => visibleText('Chest').click());
await step('back to Home', back);
await step('open settings', () => page.getByRole('button', { name: 'Settings' }).click());
await step('back from settings', back);
await step('history → day detail', async () => {
  await tab('History');
  await settle();
  await button(/^Workout /).first().click();
});
await step('day → edit workout', () => button('Edit workout').click());
await step('log: add muscle', () => button('Calves').click());
await step('tab round-trip', async () => {
  for (const t of ['Home', 'Stats', 'History', 'Log', 'Home']) {
    await tab(t);
    await page.waitForTimeout(300);
  }
});

await browser.close();
server.close();

if (errors.length) {
  console.error(`\n${errors.length} error(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('\nSmoke test passed: no page errors.');
