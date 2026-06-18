const fs = require('fs');
['hospitals', 'pharmacies', 'ambulances', 'labs'].forEach(dir => {
  const p = 'src/app/' + dir + '/[[...locationSlug]]/page.tsx';
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    if (!c.includes('force-dynamic')) {
      c = c.replace("import { db } from '@/lib/firebase';", "export const dynamic = 'force-dynamic';\nimport { db } from '@/lib/firebase';");
      fs.writeFileSync(p, c);
      console.log('Updated ' + p);
    }
  }
});
