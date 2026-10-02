const fs=require('fs');
const path=require('path');
const {chromium}=require('C:/Users/msi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1920,height:1080}});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('file:///'+path.resolve('meethaq-presentation.html').replace(/\\/g,'/'));
 await page.evaluate(()=>document.fonts.ready);
 await page.emulateMedia({reducedMotion:'reduce'});
 const results=[];
 for(const size of [{width:1920,height:1080},{width:1366,height:768},{width:800,height:600}]){
  await page.setViewportSize(size);
  for(let i=0;i<19;i++){
   await page.evaluate(i=>go(i,maxSteps(i)),i);
   const metrics=await page.evaluate(()=>{
    const s=document.querySelector('.slide.active');const root=s.getBoundingClientRect();
    const out=[];
    for(const el of s.querySelectorAll('h1,h2,h3,p,.bottom-line,td,.team-card,.contract-fields,.territories,.devices,.roadmap,.business-grid,.dash-legend')){
     const r=el.getBoundingClientRect();
     if(r.right>root.right+1||r.left<root.left-1||r.bottom>root.bottom+1||r.top<root.top-1||el.scrollWidth>el.clientWidth+3||el.scrollHeight>el.clientHeight+3)out.push({tag:el.tagName,cls:el.className,text:el.innerText?.slice(0,65),r:{x:r.x,y:r.y,w:r.width,h:r.height},scrollW:el.scrollWidth,clientW:el.clientWidth});
    }
    const bottom=s.querySelector('.bottom-line');
    const overlaps=[];if(bottom){const b=bottom.getBoundingClientRect();for(const el of s.children){if(el===bottom||['HEADER','FOOTER'].includes(el.tagName))continue;const r=el.getBoundingClientRect();if(r.bottom>b.top+1&&r.top<b.bottom&&el.className!=='body')overlaps.push({cls:el.className,bottom:r.bottom,limit:b.top});}}
    return {out,overlaps,active:document.querySelectorAll('.slide.active').length,broken:[...s.querySelectorAll('img')].filter(i=>!i.complete||!i.naturalWidth).length};
   });results.push({size,slide:i+1,...metrics});
   if(size.width===1920)await page.screenshot({path:path.join('.work',`slide-${String(i+1).padStart(2,'0')}.png`)});
  }
  await page.evaluate(()=>go(11));await page.screenshot({path:path.join('.work',`dashboard-${size.width}.png`)});
 }
 await page.setViewportSize({width:1920,height:1080});
 const check=async(name,fn)=>{try{await fn();return {name,passed:true}}catch(e){return {name,passed:false,error:String(e)}}};
 const assert=(a,m)=>{if(!a)throw Error(m)};const tests=[];
 tests.push(await check('19 slides and 15 minute timing',async()=>{assert(await page.evaluate(()=>slides.length)===19,'count');assert(await page.evaluate(()=>slides.reduce((n,s)=>n+s.seconds,0))<=900,'timing')}));
 tests.push(await check('hook next/back reveals',async()=>{await page.evaluate(()=>go(1));await page.keyboard.press('ArrowLeft');assert(await page.evaluate(()=>step)===1,'reveal1');await page.keyboard.press('Space');await page.keyboard.press('PageDown');assert(await page.evaluate(()=>step)===3,'reveal3');await page.keyboard.press('ArrowLeft');assert(await page.evaluate(()=>current)===2,'next slide');await page.keyboard.press('ArrowRight');assert(await page.evaluate(()=>current===1&&step===3),'back full');await page.keyboard.press('PageUp');assert(await page.evaluate(()=>step)===2,'reverse reveal');}));
 tests.push(await check('journey seven reveals',async()=>{await page.evaluate(()=>go(5));for(let n=0;n<7;n++)await page.keyboard.press('ArrowLeft');assert(await page.evaluate(()=>current===5&&step===7),'7');await page.keyboard.press('ArrowLeft');assert(await page.evaluate(()=>current)===6,'advance');}));
 tests.push(await check('Home End and valid invalid hash',async()=>{await page.keyboard.press('Home');assert(await page.evaluate(()=>current)===0,'home');await page.keyboard.press('End');assert(await page.evaluate(()=>current)===18,'end');await page.evaluate(()=>location.hash='#slide-6');await page.waitForFunction(()=>current===5);await page.evaluate(()=>location.hash='#slide-200');await page.waitForFunction(()=>current===0);assert(await page.evaluate(()=>location.hash)==='#slide-1','invalid hash');}));
 tests.push(await check('overview and notes dialogs',async()=>{await page.keyboard.press('o');assert(await page.locator('#overview').evaluate(e=>e.open),'overview');await page.locator('[data-slide="14"]').click();assert(await page.evaluate(()=>current)===14,'select');await page.keyboard.press('n');assert(await page.locator('#notes').evaluate(e=>e.open),'notes');assert(await page.locator('.notes-sources a').count()===3,'sources');await page.keyboard.press('Escape');assert(!await page.locator('#notes').evaluate(e=>e.open),'escape');await page.evaluate(()=>document.activeElement.blur());}));
 tests.push(await check('dashboard toggle',async()=>{await page.evaluate(()=>go(11));await page.locator('[data-role="client"]').click();assert((await page.locator('#dashboard-content').innerText()).includes('مراجعة تسليم المرحلة الثالثة'),'client');await page.locator('[data-role="freelancer"]').click();assert((await page.locator('#dashboard-content').innerText()).includes('الدخل المؤكد'),'freelancer');}));
 tests.push(await check('focused button Space does not double advance',async()=>{await page.evaluate(()=>go(0));await page.locator('#next').focus();await page.keyboard.press('Space');assert(await page.evaluate(()=>current===1&&step===0),'one advance');await page.evaluate(()=>document.activeElement.blur());}));
 tests.push(await check('fullscreen toggle and overlay close',async()=>{await page.locator('#fullscreen-btn').click();assert(await page.evaluate(()=>!!document.fullscreenElement),'entered');await page.locator('#notes-btn').click();await page.keyboard.press('Escape');assert(!await page.locator('#notes').evaluate(e=>e.open),'notes closed');await page.locator('#fullscreen-btn').click();assert(!await page.evaluate(()=>!!document.fullscreenElement),'exited');}));
 tests.push(await check('reduced motion',async()=>{assert(await page.locator('.slide.active').evaluate(e=>getComputedStyle(e).transitionDuration)==='0s','transition');}));
 tests.push(await check('touch swipe',async()=>{await page.evaluate(()=>{go(0);stage.dispatchEvent(new PointerEvent('pointerdown',{pointerId:7,pointerType:'touch',clientX:500,clientY:400,bubbles:true}));stage.dispatchEvent(new PointerEvent('pointerup',{pointerId:7,pointerType:'touch',clientX:300,clientY:400,bubbles:true}));});assert(await page.evaluate(()=>current)===1,'swipe');}));
 await page.emulateMedia({media:'print'});await page.pdf({path:'.work/print-check.pdf',printBackground:true,preferCSSPageSize:true});
 const print=await page.evaluate(()=>({slides:[...document.querySelectorAll('.slide')].filter(s=>getComputedStyle(s).visibility==='visible').length,hiddenReveals:[...document.querySelectorAll('[data-reveal]')].filter(s=>getComputedStyle(s).visibility!=='visible').length,controls:getComputedStyle(document.getElementById('controls')).display}));
 await page.emulateMedia({media:'screen',reducedMotion:'no-preference'});await page.evaluate(()=>go(3));await page.waitForTimeout(1200);await page.screenshot({path:'.work/problem-motion.png'});
 const content=await page.evaluate(()=>slides.map((s,i)=>({slide:i+1,notes:s.notes,transition:s.transition,text:els[i].textContent})));
 fs.writeFileSync('.work/verification.json',JSON.stringify({errors,tests,print,layout:results,content},null,2));
 console.log(JSON.stringify({errors,tests,print,layoutIssues:results.filter(x=>x.out.length||x.overlaps.length||x.broken),timing:content.length},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
