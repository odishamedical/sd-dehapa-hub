const fs = require('fs');

let content = fs.readFileSync('src/app/portal/page.tsx', 'utf8');

// 1. Add missing tabs to userTabs array
if (!content.includes('id: "appointments"')) {
  content = content.replace('id: "vault",', `id: "appointments",
      label: "My Appointments",
      section: "QUICK ACTIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    },
    {
      id: "billing",
      label: "Billing & Invoices",
      section: "QUICK ACTIONS",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
    },
    {
      id: "vault",`);
}

// 2. Add hydration state and logic
const existingUseEffect = 'checkProfile();\n      }\n    }\n  }, [router]);';
if (!content.includes('const [isProfileLoaded, setIsProfileLoaded] = useState(false);')) {
  const hydrationState = `checkProfile();
      }
    }
  }, [router]);

  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!userEmail) return;
      try {
        const currentUid = localStorage.getItem("sd_current_user_uid");
        if (currentUid) {
          setUid(currentUid);
          const docRef = doc(db, 'directory', currentUid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.basicInfo) setIdentityData(data.basicInfo);
            if (data.locationAddress) setAddressData(data.locationAddress);
            if (data.familyMembers) setFamilyMembers(data.familyMembers);
          }
        }
      } catch (err) {
        console.error("Failed to load patient profile", err);
      } finally {
        setIsProfileLoaded(true);
      }
    };
    if (userEmail) fetchPatientData();
  }, [userEmail]);`;
  
  content = content.replace(existingUseEffect, hydrationState);
}

// 3. Render the new tabs UI
const newTabUIs = `{activeTab === "appointments" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">My Appointments</h3>
            <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-[24px] border border-white/60 shadow-sm">
              <div className="w-16 h-16 bg-white/80 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <p className="text-slate-900 font-bold text-lg mb-1">No Appointments Found</p>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">You have no upcoming or past visits recorded in the system.</p>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Billing & Invoices</h3>
            <div className="text-center py-16 bg-white/40 backdrop-blur-md rounded-[24px] border border-white/60 shadow-sm">
              <div className="w-16 h-16 bg-white/80 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
              <p className="text-slate-900 font-bold text-lg mb-1">No Transactions</p>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">Your payment history and invoices will securely appear here.</p>
            </div>
          </div>
        )}

        {activeTab === "vault" && (`;

if (!content.includes('activeTab === "appointments"')) {
  content = content.replace('{activeTab === "vault" && (', newTabUIs);
}

fs.writeFileSync('src/app/portal/page.tsx', content);
console.log("Hydration and tabs safely added to portal/page.tsx");
