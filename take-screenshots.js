const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Mobile screenshot (390x844 - iPhone size)
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(3000); // Wait 3 seconds for map to load
  await page.screenshot({ path: '/opt/cursor/artifacts/spaza-mobile-light.png', fullPage: false });
  console.log('Mobile screenshot saved');
  
  // Desktop screenshot (1440x900)
  await page.setViewport({ width: 1440, height: 900 });
  await page.waitForTimeout(2000); // Wait 2 seconds for layout
  await page.screenshot({ path: '/opt/cursor/artifacts/spaza-desktop-light.png', fullPage: false });
  console.log('Desktop screenshot saved');
  
  await browser.close();
})();
