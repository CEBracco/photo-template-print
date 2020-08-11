const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/polaroid');
    const elements = await page.$$('.page')
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        await element.screenshot({ path: `page-${index}.png` });
    }    

    await browser.close();
})();