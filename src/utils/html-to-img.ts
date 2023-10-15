import { chromium } from 'playwright-core';

async function htmlToImage(html: string) {
  try {
    const browser = await chromium.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
    });

    const page = await browser.newPage();

    await page.setContent(html);

    await page.waitForEvent('domcontentloaded');

    await page.waitForSelector('body');

    const img = await page.screenshot();

    await browser.close();

    return img;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default htmlToImage;
