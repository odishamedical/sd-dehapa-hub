const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/EntitySearchInput.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex1 = /className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-4 py-3 shadow-\[inset_0_2px_4px_rgba\(0,0,0,0\.02\)\] text-slate-900 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500\/20 outline-none transition-all pr-10"/g;
const replace1 = 'className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl px-5 py-3.5 shadow-sm text-slate-900 text-sm focus:border-teal-500 outline-none transition-all pr-10"';

let newContent = content.replace(regex1, replace1);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("SUCCESS");
