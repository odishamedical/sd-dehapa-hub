const fs = require('fs');
let code = fs.readFileSync('src/app/portal/admin/page.tsx', 'utf8');

const tabToAdd = `    {
      id: "staff",
      label: "Staff Management",
      section: "System Controls",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    },`;

if (!code.includes('id: "staff"')) {
    code = code.replace(
        `    {
      id: "audit",`,
        `${tabToAdd}\n    {
      id: "audit",`
    );
}

const renderToAdd = `          {activeTab === "staff" && (
            <AdminStaffManagement />
          )}`;

if (!code.includes('<AdminStaffManagement />')) {
    code = code.replace(
        `          {activeTab === "settings" && (`,
        `${renderToAdd}\n\n          {activeTab === "settings" && (`
    );
}

fs.writeFileSync('src/app/portal/admin/page.tsx', code, 'utf8');
console.log("Patched page.tsx");
