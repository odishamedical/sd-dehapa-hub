const fs = require('fs');
const p = 'e:/web-app-projects-2026/sd-dehapa-hub/src/components/AdminDataCRM.tsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/className="form-label"/g, 'className="form-label-dark"');
c = c.replace(/className="form-input"/g, 'className="form-input-dark"');
c = c.replace(/className="form-select"/g, 'className="form-select-dark"');
c = c.replace(/className="form-input bg-white"/g, 'className="form-input-dark"');
c = c.replace(/className="form-input bg-emerald-50\/50 border-emerald-200 focus:border-emerald-500"/g, 'className="form-input-dark !bg-emerald-900/20 !border-emerald-700/50 !text-emerald-400 focus:!border-emerald-500"');
fs.writeFileSync(p, c);
