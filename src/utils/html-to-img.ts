import { chromium } from 'playwright-core';

async function htmlToImage(html: string) {
  try {
    const browser = await chromium.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
    });

    const page = await browser.newPage();

    page.setContent(html);

    const img = await page.screenshot();

    await browser.close();

    return img;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default htmlToImage;
