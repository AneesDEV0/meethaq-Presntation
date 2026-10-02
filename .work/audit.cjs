const fs=require('fs');
const {chromium}=require('C:/Users/msi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const report=JSON.parse(fs.readFileSync('.work/verification.json','utf8'));
const content=report.content.map(s=>s.text+' '+s.notes+' '+s.transition).join('\n');
const forbidden=['MVP','Next.js','Flutter','JavaScript','Dev legion','تم الإنجاز','الأفضل في السوق','استثمار','تمويل','دعم مادي','شريك رسمي','متاح الآن','رصيد محفظة'];
console.log('Forbidden matches:',forbidden.filter(t=>content.includes(t)));
console.log('Team roles:', ['BACKEND DEVELOPER','FRONTEND DEVELOPER','MOBILE DEVELOPER'].map(t=>[t,content.split(t).length-1]));
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});const context=await browser.newContext({offline:true,viewport:{width:1366,height:768}});const page=await context.newPage();await page.goto('file:///C:/Users/msi/Desktop/Meethaq%20Presntation/meethaq-presentation.html#slide-6');await page.evaluate(()=>document.fonts.ready);console.log('Offline:',await page.evaluate(()=>({slide:current+1,font:document.fonts.check('700 40px Tajawal'),images:[...document.images].every(i=>i.complete&&i.naturalWidth>0),externalAssets:[...document.querySelectorAll('img[src],script[src],link[href]')].filter(e=>(e.src||e.href).startsWith('http')).length})));await browser.close()})();
