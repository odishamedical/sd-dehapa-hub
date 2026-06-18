const fs = require('fs');

let code = fs.readFileSync('src/app/portal/admin/page.tsx', 'utf8');

const targetStr = `                            ) : (
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1"><svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Verified</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>`;

const replacementStr = `                            ) : claim.status === 'approved' ? (
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
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/app/portal/admin/page.tsx', code);
  console.log("Successfully replaced UI string block.");
} else {
  console.error("COULD NOT FIND TARGET STRING. Aborting to avoid corruption.");
}
