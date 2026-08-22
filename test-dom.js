const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/editor');
  await page.waitForSelector('main');

  const data = await page.evaluate(() => {
    const root = document.querySelector('.flex.fixed.inset-0') || document.querySelector('.flex.absolute.inset-0');
    return {
      htmlHeight: document.documentElement.clientHeight,
      htmlScrollHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.clientHeight,
      bodyScrollHeight: document.body.scrollHeight,
      rootHeight: root?.clientHeight,
      rootScrollHeight: root?.scrollHeight,
      rootCssText: root?.style.cssText,
      rootClassList: root?.className,
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
