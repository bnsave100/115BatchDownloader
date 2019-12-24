const puppeteer = require('puppeteer');

(async () => {
  const wsChromeEndpointurl = 'ws://127.0.0.1:9222/devtools/browser/b4214174-ebe1-4bb6-ba31-d4453ee292b9';

  const browser = await puppeteer.connect({
      browserWSEndpoint: wsChromeEndpointurl,
  });
  const page = await browser.newPage();
  await page.goto('https://115.com/?tab=offline&mode=wangpan', {
      waitUntil: 'networkidle0'
  });

  // get all current page li
  const iframeElement = await page.$('#js_center_main_box iframe');
  //console.log(iframeElement);
  const iframeContent = await iframeElement.contentFrame();
  //console.log(example);
  const itemArray = await iframeContent.$$('div.offline-list > ul > li > .ofli-name');
  const itemArrayLength = itemArray.length;
  //const itemArrayLength = 1;  // fix to 1
  console.log(`total item to download: ${itemArray.length}`);

  for (let i = 0; i < itemArrayLength; i++ ){
    console.log('clicking '+String(i));

    // re get all items
    const iframeElement = await page.$('#js_center_main_box iframe');
    const iframeContent = await iframeElement.contentFrame();
    const itemArray = await iframeContent.$$('div.offline-list > ul > li > .ofli-name');

    await itemArray[i].click();
    await page.waitFor(4000);

    let itemIframe = await page.$('#js_center_main_box iframe');
    let itemContent = await itemIframe.contentFrame();
    //console.log(itemContent);
    let fileArray = await itemContent.$$('div.list-contents > ul > li');

    for ( let j = 0; j < fileArray.length; j++ ){
      let size = await itemContent.evaluate(el => el.getAttribute("file_size"), fileArray[j]);
      if (Number(size) < 500000000) {
        console.log(`file ${j} is too small to download at ${size} byte`);
        continue;
      } else {
        console.log(`let\'s click No.${j} item`);
        // click item so aria download button show up
        await fileArray[j].click();
        // have to wait 1 sec for tempermonkey to add button
        await page.waitFor(1000);

        //let downloadIframe = await page.$('#js_center_main_box iframe');
        //let downloadContent = await downloadIframe.contentFrame();
        let downloadButton = await itemContent.$x("//li[@id='aria2Trigger']");
        await downloadButton[0].click();
        await page.waitFor(4000);

        // log download file and break (only download 1 file)
        let fileTitle = await itemContent.evaluate(el => el.getAttribute("title"), fileArray[j]);
        console.log(`sucessfully download ${fileTitle}`);
        break;
      }

      await page.waitFor(10000);
    }

    // go back to main page
    await page.goto('https://115.com/?tab=offline&mode=wangpan', {
        waitUntil: 'networkidle0'
    });
  }
  /*const item_count = await page.evaluate( () =>
    document.querySelectorAll('#js_center_main_box iframe')[0].contentWindow.document.querySelectorAll('div.offline-list > ul > li > .ofli-name')
  )
  debugger;
  console.log(item_count);

  for (let i = 0; i < Number(item_count) - 1; i++ ){
    console.log('clicking '+ String(i))
    let clicker = await page.evaluate( (i) => {
      return document.querySelectorAll('#js_center_main_box iframe')[0].contentWindow.document.querySelectorAll('div.offline-list > ul > li')[i];
    });
    console.log(clicker)
    page.click(clicker);
    await page.waitFor(10000)
    await page.goto('https://115.com/?tab=offline&mode=wangpan', {
        waitUntil: 'networkidle0'
    });
  }*/

})();
