const fs = require('fs');

let code = fs.readFileSync('src/app/portal/admin/page.tsx', 'utf8');

// 1. Add handleRevokeClaim function
const revokeCode = `  const handleRevokeClaim = async (claim: any) => {
    if (!confirm("Are you sure you want to revoke this verification? This will remove the user's access to the listing.")) return;
    try {
      const batch = writeBatch(db);
      
      // Update claim status back to pending or create a new status 'revoked'. Let's use 'pending' so it can be re-approved if needed, or 'rejected'.
      // We will set it to 'rejected'.
      batch.update(doc(db, 'listing_claims', claim.id), { status: 'rejected' });
      
      // Update listing in directory
      if (claim.listingId !== "new_listing") {
        batch.update(doc(db, 'directory', claim.listingId), {
          verified: false,
          ownerEmail: null
        });
      }
      
      await batch.commit();
      
      // update state
      setListingClaims(claims => claims.map(c => c.id === claim.id ? { ...c, status: 'rejected' } : c));
      alert("Verification Revoked.");
    } catch (err) {
      console.error("Revoke error:", err);
      alert("Failed to revoke claim.");
    }
  };

  const handleApproveClaim`;

if (!code.includes('handleRevokeClaim')) {
  code = code.replace('const handleApproveClaim', revokeCode);
}

// 2. Update UI
const oldUi = `                            ) : (
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1"><svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Verified</span>
                            )}`;

const newUi = `                            ) : claim.status === 'approved' ? (
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1"><svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Verified</span>
                                <button 
                                  onClick={() => handleRevokeClaim(claim)}
                                  className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline uppercase tracking-widest"
                                >
                                  Revoke
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1"> Rejected</span>
                            )}`;

if (code.includes(oldUi)) {
  code = code.replace(oldUi, newUi);
}

fs.writeFileSync('src/app/portal/admin/page.tsx', code);
console.log('Successfully added Revoke button');
