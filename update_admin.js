const fs = require('fs');

let code = fs.readFileSync('src/app/portal/admin/page.tsx', 'utf8');

if (!code.includes('import AdminPlatformSettings')) {
  code = code.replace("import AdminAdEngine from '@/components/AdminAdEngine';", "import AdminAdEngine from '@/components/AdminAdEngine';\nimport AdminPlatformSettings from '@/components/AdminPlatformSettings';");
}

const settingsTab = `    {
      id: "settings",
      label: "Platform Settings",
      section: "System Controls",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
    },
    {
      id: "god-mode",`;

if (!code.includes('id: "settings"')) {
  code = code.replace(/\{\s*id:\s*"god-mode",/, settingsTab);
}

const settingsUI = `          {activeTab === "settings" && (
            <AdminPlatformSettings />
          )}

          {activeTab === "god-mode"`;

if (!code.includes('activeTab === "settings"')) {
  code = code.replace(/\{\s*activeTab\s*===\s*"god-mode"/, settingsUI);
}

fs.writeFileSync('src/app/portal/admin/page.tsx', code);
console.log('Successfully updated Admin page.tsx');
