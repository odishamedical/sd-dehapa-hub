const fs = require('fs');
let f, c;

f = 'src/lib/directoryConfig.ts';
c = fs.readFileSync(f, 'utf8');
c = c.replace('in?: any[]; }', 'in?: any[]; contains?: any; }');
fs.writeFileSync(f, c);

f = 'src/components/PatientConsultWidget.tsx';
c = fs.readFileSync(f, 'utf8');
c = c.replace(/useState\<"payment" \| "tier" \| "pinging"\>/g, 'useState<"payment" | "tier" | "pinging" | "hardware_check">');
fs.writeFileSync(f, c);

f = 'src/components/SecureMedicalVault.tsx';
c = fs.readFileSync(f, 'utf8');
c = c.replace('docToForward: VaultDocument;', 'docToForward: any; providerId?: string;');
fs.writeFileSync(f, c);

console.log('Fixed additional types');
