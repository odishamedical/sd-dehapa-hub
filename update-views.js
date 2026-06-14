const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src/components/views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('ListingView.tsx'));

const regex1 = /className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-tenant-accent transition-colors shadow-sm"/g;
const replace1 = 'className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl pl-12 pr-5 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-tenant-accent transition-all shadow-sm"';

for (const file of files) {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(regex1, replace1);
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
}
console.log("SUCCESS VIEWS");
