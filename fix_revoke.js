const fs = require('fs');

let code = fs.readFileSync('src/app/portal/admin/page.tsx', 'utf8');

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
  fs.writeFileSync('src/app/portal/admin/page.tsx', code);
  console.log("Successfully replaced the UI block via strict string match.");
} else {
  // Try regex replace if string match fails due to line endings
  console.log("Strict string match failed. Trying regex...");
  const regex = /\\) : \\(\\s*<span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1"><svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"><\\/path><\\/svg> Verified<\\/span>\\s*\\)}/;
  
  if (regex.test(code)) {
    code = code.replace(regex, newUi.trim());
    fs.writeFileSync('src/app/portal/admin/page.tsx', code);
    console.log("Successfully replaced the UI block via regex match.");
  } else {
    console.log("Regex match also failed. Could not find the block.");
  }
}
