const fs = require('fs');
let code = fs.readFileSync('src/app/portal/admin/page.tsx', 'utf8');

// 1. Add import
if (!code.includes('import AdminUserManagement')) {
    code = code.replace(
        `import AdminStaffManagement from '@/components/AdminStaffManagement';`,
        `import AdminStaffManagement from '@/components/AdminStaffManagement';\nimport AdminUserManagement from '@/components/AdminUserManagement';`
    );
}

// 2. Replace the static users tab with the real one
const staticBlockRegex = /\{activeTab === "users" && \([\s\S]*?<!-- end static users -->|\{activeTab === "users" && \([\s\S]*?<\/[dD]iv>\s*\)\}/;

// The static block is:
//           {activeTab === "users" && (
//             <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
//               ...
//               </div>
//             </div>
//           )}

// I will just replace exactly the known content based on view_file output.
const replacement = `{activeTab === "users" && <AdminUserManagement />}`;

// Regex to match the block:
// \{activeTab === "users" && \([\s\S]*?No Active Users[\s\S]*?<\/[dD]iv>\s*<\/div>\s*\)\}
const blockRegex = /\{activeTab === "users" && \([\s\S]*?No Active Users[\s\S]*?<\/div>\s*<\/div>\s*\)\}/;

if (blockRegex.test(code)) {
    code = code.replace(blockRegex, replacement);
    console.log("Patched users block via regex");
} else {
    console.log("Regex didn't match the users block.");
}

fs.writeFileSync('src/app/portal/admin/page.tsx', code, 'utf8');
