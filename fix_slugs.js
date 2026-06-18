const fs = require('fs');
['doctors', 'hospitals', 'pharmacies', 'ambulances', 'labs'].forEach(dir => {
  const p = 'src/app/' + dir + '/[[...locationSlug]]/page.tsx';
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    // Replace the length > 20 check with a more strict ID check
    c = c.replace(/slug\[0\]\.length > 20/g, "(slug[0].length === 20 && !slug[0].includes('-'))");
    fs.writeFileSync(p, c);
    console.log('Updated ' + p);
  }
});
