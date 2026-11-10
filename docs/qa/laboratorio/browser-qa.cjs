// Run with Playwright available on NODE_PATH; serve the production build on port 4173.
const path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const results=[];
 for(const lang of ['es','en']) for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`http://127.0.0.1:4173/laboratorio/?s=42&v=1&g=2&nivel=5&pol=manuscrito&riesgo=alto&lang=${lang}`);
  await page.getByRole('heading',{name:lang==='es'?'Situación':'Situation',exact:true}).waitFor();
  await page.getByRole('button',{name:lang==='es'?'Actuar':'Act',exact:true}).click();
  await page.getByText(lang==='es'?'Comparación matemática hipotética':'Hypothetical mathematical comparison',{exact:true}).waitFor();
  const original=await page.locator('.lab-record pre').innerText();
  await page.getByRole('button',{name:lang==='es'?'Siguiente paso':'Next step',exact:true}).click();
  await page.locator('summary').filter({hasText:lang==='es'?'¿Qué cambiaría':'What would change'}).click();
  const slider=page.getByRole('slider').first();await slider.focus();await page.keyboard.press('Home');
  if(await page.locator('.lab-record pre').innerText()!==original) throw Error('Sensitivity changed base record');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(overflow||errors.length)throw Error(JSON.stringify({overflow,errors}));
  await page.screenshot({path:path.join(__dirname, `${lang}-${mobile?'mobile':'desktop'}.png`),fullPage:true});
  for(let level=1;level<=5;level++){
    await page.getByRole('combobox').selectOption(String(level));
    await page.getByRole('button',{name:lang==='es'?'Generar situación':'Generate a situation',exact:true}).click();
    if(await page.locator('.lab-record').count())throw Error('Generation did not reset reveal');
    await page.getByRole('button',{name:lang==='es'?'Ver sin elegir':'See without choosing',exact:true}).click();
    const record=await page.locator('.lab-record pre').innerText();await page.reload();
    await page.locator('.lab-record pre').waitFor();
    if(await page.locator('.lab-record pre').innerText()!==record)throw Error('Reload mismatch');
  }
  results.push({lang,viewport:mobile?'390x844':'1440x1000',levels:5,overflow,errors,sensitivityIsolated:true,reloadStable:true});await page.close();
 }
 console.log(JSON.stringify(results,null,2));await browser.close();
})();
