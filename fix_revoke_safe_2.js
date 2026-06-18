const fs = require('fs');

let code = fs.readFileSync('src/app/portal/admin/page.tsx', 'utf8');

// The exact line is:
//                             ) : (
//                               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1"><svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Verified</span>
//                             )}

const target1 = `                            ) : (
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1"><svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Verified</span>
                            )}`;

const replace1 = `                            ) : claim.status === 'approved' ? (
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1"><svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Verified</span>
                                <button 
                                  onClick={() => handleRevokeClaim(claim)}
                                  className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline uppercase tracking-widest"
                                >
                                  Revoke Verification
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1"> Rejected</span>
                            )}`;

// Because CRLF differences break it, I will split and join
const normalizedCode = code.replace(/\\r\\n/g, '\\n');
const normalizedTarget = target1.replace(/\\r\\n/g, '\\n');

if (normalizedCode.includes(normalizedTarget)) {
  code = normalizedCode.replace(normalizedTarget, replace1);
  fs.writeFileSync('src/app/portal/admin/page.tsx', code);
  console.log("SUCCESS");
} else {
  console.log("STILL FAILING");
}
