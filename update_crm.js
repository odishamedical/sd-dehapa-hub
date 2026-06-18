const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDataCRM.tsx', 'utf8');

// 1. Add generateMagicLink function
const funcCode = `  const removeDynamicField = (index: number) => setDynamicFields(dynamicFields.filter((_, i) => i !== index));

  const generateMagicLink = () => {
    if (!selectedListing || !selectedListing.id) return;
    if (selectedListing.id.startsWith("NEW_")) {
      alert("Please Save the listing first before generating a link.");
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dehapa.com';
    const link = \`\${origin}/invite/\${selectedListing.id}\`;
    navigator.clipboard.writeText(link);
    alert(\`Magic Link Copied!\\n\\n\${link}\\n\\nSend this via WhatsApp. When the doctor clicks it, they will instantly take ownership of this profile.\`);
  };`;

if (!code.includes('const generateMagicLink = () => {')) {
  code = code.replace('const removeDynamicField = (index: number) => setDynamicFields(dynamicFields.filter((_, i) => i !== index));', funcCode);
}

// 2. Add the button to the UI
const uiCode = `                <div>
                  <label className="form-label">Assigned Owner Email</label>
                  <input type="text" value={selectedListing.assignedOwnerEmail || ""} onChange={e => setSelectedListing({...selectedListing, assignedOwnerEmail: e.target.value})} className="form-input" placeholder="e.g. user@example.com" />
                </div>
                <div className="relative flex flex-col justify-end">
                  <button 
                    onClick={generateMagicLink}
                    className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 px-4 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    Copy Magic Invite Link
                  </button>
                  <p className="text-[10px] text-slate-500 mt-2 text-center">Ghost Onboarding: Send link via WhatsApp to auto-assign profile.</p>
                </div>
                <div className="relative">`;

if (!code.includes('Copy Magic Invite Link')) {
  // It originally looks like:
  //                 <div>
  //                   <label className="form-label">Assigned Owner Email</label>
  //                   <input type="text" value={selectedListing.assignedOwnerEmail || ""} onChange={e => setSelectedListing({...selectedListing, assignedOwnerEmail: e.target.value})} className="form-input" placeholder="e.g. user@example.com" />
  //                 </div>
  //                 <div className="relative">
  //                   <label className="form-label">Custom Slug</label>

  const searchTarget = `                <div>
                  <label className="form-label">Assigned Owner Email</label>
                  <input type="text" value={selectedListing.assignedOwnerEmail || ""} onChange={e => setSelectedListing({...selectedListing, assignedOwnerEmail: e.target.value})} className="form-input" placeholder="e.g. user@example.com" />
                </div>
                <div className="relative">`;

  code = code.replace(searchTarget, uiCode);
}

fs.writeFileSync('src/components/AdminDataCRM.tsx', code);
console.log("Successfully updated AdminDataCRM to include Magic Links.");
