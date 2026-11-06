import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const TARGET_URL = process.env.TARGET_URL || 'https://wn.ifree.page';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  locale: 'zh-CN',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
const page = await context.newPage();

try {
  const response = await page.goto(TARGET_URL, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  const status = response?.status() ?? 0;
  console.log(`HTTP 状态码: ${status}`);
  console.log(`页面标题: ${await page.title()}`);

  // 等待页面完全渲染后再截图
  await page.waitForTimeout(3000);

  mkdirSync(process.cwd(), { recursive: true });
  await page.screenshot({ path: 'screenshot.png', fullPage: false });
  console.log('截图已保存: screenshot.png');

  if (status >= 400) {
    console.error(`::error::访问失败，状态码: ${status}`);
    process.exitCode = 1;
  }
} catch (err) {
  console.error(`::error::访问出错: ${err.message}`);
  try {
    await page.screenshot({ path: 'screenshot.png', fullPage: false });
    console.log('失败状态截图已保存: screenshot.png');
  } catch {}
  process.exitCode = 1;
} finally {
  await browser.close();
}
