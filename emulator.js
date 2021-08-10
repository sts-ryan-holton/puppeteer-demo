const dayjs = require('dayjs');
const AdvancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(AdvancedFormat);

const puppeteer = require('puppeteer');

async function runEmulation () {

  const goToUrl = 'https://example.com/';

  // vars
  const journey = [];
  let hopDataToReturn;

  // initiate a Puppeteer instance with options and launch
  const browser = await puppeteer.launch({
    headless: false
  });

  // launch a new page
  const page = await browser.newPage();

  // initiate a new CDP session
  const client = await page.target().createCDPSession();
  await client.send('Network.enable');
  await client.on('Network.requestWillBeSent', async (e) => {

    // if not a document, skip
    if (e.type !== 'Document') return;

    console.log(`adding URL to journey: ${e.documentURL}`)

    // the journey
    journey.push({
      url: e.documentURL,
      type: e.redirectResponse ? e.redirectResponse.status : 'JS Redirection',
      duration_in_ms: 0,
      duration_in_sec: 0,
      loaded_at: dayjs().valueOf()
    });
  });

  await page.goto(goToUrl);
  await page.waitForNavigation();
  await browser.close();

  console.log('=== JOURNEY ===')
  console.log(journey)
}

// init
runEmulation()
