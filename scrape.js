const puppeteer = require('puppeteer');
var fs = require('fs');
var ProgressBar = require('progress');

const outputFolder = 'output-scraped';

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // create folder if it does not exist
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }

    const startYear = 1970;
    const endYear = 2017;
    var bar = new ProgressBar('[:bar] :percent :etas', { total: endYear - startYear });

    for (let year = startYear; year <= endYear; year++) {
        await page.goto(`https://www.sports-reference.com/cfb/years/${year}-polls.html`);

        let standingDiv = await page.$('table.poll.stats_table');

        var html = await getElementHtml(standingDiv);
        fs.writeFileSync(outputFolder + '/' + year + '.html', html);

        // add some sleep to not bog down the server
        await sleep(10000);

        bar.tick();
    }

    await browser.close();
})();

function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}

async function getElementHtml(elementHandle, selector) {
    let el = elementHandle;

    if (null != selector) {
        el = await elementHandle.$(selector);
    }

    if (null == el) {
        return '';
    }

    let textProperty = await el.getProperty('outerHTML');
    let text = await textProperty.jsonValue();

    return text.trim();
}