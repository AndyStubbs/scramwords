/*
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  //const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.merriam-webster.com/dictionary/acideafa');
  const element = await page.$(".mispelled-word");
  if( element ) {
    const text = await (await element.getProperty("innerText")).jsonValue();
    console.log( "Word Not Found: " + text );
  } else {
      console.log( "Word Found.");
  }
  
  await browser.close();
})();
*/

