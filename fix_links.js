const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  if (c.includes('href="/v2/')) {
    c = c.replace(/href="\/v2\//g, 'href="/');
    changed = true;
  }
  
  if (c.includes('href={`/v2/')) {
    c = c.replace(/href=\{\`\/v2\//g, 'href={`/');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(f, c);
    console.log('Updated', f);
  }
});
console.log('Done');
