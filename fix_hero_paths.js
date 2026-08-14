const fs = require('fs'); 
const files = [
  'src/app/search/pharmacies/page.tsx', 
  'src/app/search/hospitals/page.tsx', 
  'src/app/search/doctors/page.tsx', 
  'src/app/search/labs/page.tsx', 
  'src/app/search/ambulances/page.tsx'
]; 
files.forEach(f => { 
  try { 
    let c = fs.readFileSync(f, 'utf8'); 
    c = c.replace(/desktopBgImage="\/pc-/g, 'desktopBgImage="/v2/pc-'); 
    c = c.replace(/mobileBgImage="\/phone-/g, 'mobileBgImage="/v2/phone-'); 
    fs.writeFileSync(f, c); 
    console.log('Updated ' + f); 
  } catch (e) { 
    console.log('Skipped ' + f); 
  } 
});
