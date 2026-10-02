const fs = require('fs');
const path = require('path');
const base = __dirname;
const uri = (file, mime) => `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
const photos = [
 'C:/Users/msi/Downloads/801008796_18106607798238509_8407092708845244956_n.jpg',
 'C:/Users/msi/AppData/Local/Temp/codex-clipboard-4321bbaf-681a-4861-bf56-735979378caa.png',
 'C:/Users/msi/AppData/Local/Temp/codex-clipboard-df44ce6e-8714-4cf0-a440-9ebb0885020a.png',
 'C:/Users/msi/AppData/Local/Temp/codex-clipboard-25f50348-0d6c-4356-8b64-9a71281f14a8.png'
];
let html = fs.readFileSync(path.join(base, 'deck.template.html'), 'utf8');
html = html.replace('__FONT_CSS__', [400,500,700,800].map(w => `@font-face{font-family:Tajawal;font-style:normal;font-weight:${w};font-display:swap;src:url('${uri(path.join(base,`tajawal-${w}.ttf`),'font/ttf')}') format('truetype')}`).join('\n'));
html = html.replace('__LOGO__', uri(path.join(base, 'logo.webp'), 'image/webp'));
photos.forEach((p,i) => { html = html.replace(`__PHOTO_${i}__`, uri(p, p.endsWith('.jpg')?'image/jpeg':'image/png')); });
html = html.replace('__FONT_LICENSE__', fs.readFileSync(path.join(base,'OFL.txt'),'utf8'));
fs.writeFileSync(path.join(base,'../meethaq-presentation.html'),html);
console.log('Built meethaq-presentation.html: '+Math.round(Buffer.byteLength(html)/1024)+' KB');
