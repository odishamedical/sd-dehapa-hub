const fs = require('fs');

const data = fs.readFileSync('drdeepak.doc', 'binary');
const cleaned = data.replace(/[^\x20-\x7E\n]/g, '');
console.log(cleaned.replace(/ {2,}/g, ' '));
