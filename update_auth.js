const fs = require('fs');

let code = fs.readFileSync('src/app/portal/admin/page.tsx', 'utf8');

// 1. Imports
if (!code.includes('import AdminStaffManagement')) {
  code = code.replace("import AdminAnalyticsOverview from '@/components/AdminAnalyticsOverview';", "import AdminAnalyticsOverview from '@/components/AdminAnalyticsOverview';\nimport AdminStaffManagement from '@/components/AdminStaffManagement';");
}
if (!code.includes('getDoc,')) {
  code = code.replace('writeBatch, doc,', 'writeBatch, doc, getDoc,');
}

// 2. Auth Logic Update
const oldAuth = `    let role = localStorage.getItem("sd_current_user_role") || "none";
    const email = localStorage.getItem("sd_current_user_email");
    if (email === 'odishamedical@gmail.com') role = 'super_admin';
    
    // Accept any admin role
    if (["super_admin", "data_entry", "verification_officer", "auditor"].includes(role)) {
      setAccessGranted(true);
      setUserRole(role);
      
      // Auto-set the active tab based on role if they enter with "overview" but don't have access
      if (role === "data_entry") setActiveTab("data-crm");
      if (role === "verification_officer") setActiveTab("verification");
      if (role === "auditor") setActiveTab("audit");
    } else {
      setAccessGranted(false);
    }
    setLoading(false);`;

const newAuth = `    const email = localStorage.getItem("sd_current_user_email");
    
    async function checkAdminAccess() {
      if (!email) {
        setAccessGranted(false);
        setLoading(false);
        return;
      }
      
      let role = localStorage.getItem("sd_current_user_role") || "none";
      if (email === 'odishamedical@gmail.com') role = 'super_admin';
      
      // Check Firestore for dynamic roles
      try {
        const docRef = doc(db, 'admin_users', email.toLowerCase());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          role = docSnap.data().role;
          localStorage.setItem("sd_current_user_role", role);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
      
      if (["super_admin", "data_entry", "verification_officer", "auditor"].includes(role)) {
        setAccessGranted(true);
        setUserRole(role);
        if (role === "data_entry") setActiveTab("data-crm");
        if (role === "verification_officer") setActiveTab("verification");
        if (role === "auditor") setActiveTab("audit");
      } else {
        setAccessGranted(false);
      }
      setLoading(false);
    }
    checkAdminAccess();`;

if (code.includes(oldAuth)) {
  code = code.replace(oldAuth, newAuth);
}

// 3. UI replacement for "users" tab
const oldUsersUI = `          {activeTab === "users" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Registered Platform Users</h3>
                  <p className="text-sm text-slate-500">By default, all new users are assigned the "Patient" role.</p>
                </div>
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">Export CSV</button>
              </div>
              
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <p className="font-bold text-slate-900 mb-1">No Active Users</p>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">Users fetched from Firebase Auth will appear here.</p>
              </div>
            </div>
          )}`;

const newUsersUI = `          {activeTab === "users" && (
            <div className="space-y-8">
              <AdminStaffManagement />
              
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold">Patient Directory</h3>
                    <p className="text-sm text-slate-500">Live patient accounts created via Firebase Auth.</p>
                  </div>
                  <button className="bg-slate-100 text-slate-400 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-not-allowed">Export CSV (Coming Soon)</button>
                </div>
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="font-bold text-slate-400 mb-1">Patient List API Connecting...</p>
                  <p className="text-xs text-slate-400">Firebase Auth listUsers is an Admin SDK command. Next.js API route required.</p>
                </div>
              </div>
            </div>
          )}`;

if (code.includes(oldUsersUI)) {
  code = code.replace(oldUsersUI, newUsersUI);
}

fs.writeFileSync('src/app/portal/admin/page.tsx', code);
console.log("Successfully updated auth and users tab");
