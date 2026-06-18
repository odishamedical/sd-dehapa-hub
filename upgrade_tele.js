const fs = require('fs');

let content = fs.readFileSync('src/components/PatientConsultWidget.tsx', 'utf8');

// Replace "pinging" screen UI
content = content.replace(/className="bg-sky-50 border-2 border-sky-200 rounded-3xl p-8 text-center animate-in zoom-in duration-500 relative overflow-hidden"/g, 'className="bg-white/30 backdrop-blur-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 rounded-[32px] p-8 md:p-12 text-center animate-in zoom-in duration-500 relative overflow-hidden"');

content = content.replace(/className="text-2xl font-black text-sky-900 mb-2"/g, 'className="text-2xl md:text-3xl font-black text-slate-900 mb-2"');
content = content.replace(/className="text-sky-700 font-medium"/g, 'className="text-slate-600 font-medium"');
content = content.replace(/className="text-sm text-sky-600 mt-4 max-w-sm"/g, 'className="text-sm text-slate-500 mt-4 max-w-sm"');

// Replace "payment" screen UI
content = content.replace(/className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8"/g, 'className="bg-white/30 backdrop-blur-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.7)] border border-white/60 rounded-[32px] p-8 md:p-10 relative overflow-hidden"');
content = content.replace(/className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8 flex justify-between items-center"/g, 'className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] mb-8 flex justify-between items-center"');

content = content.replace(/className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl text-lg transition-all shadow-md"/g, 'className="w-full bg-[#0a1229] hover:bg-[#040815] text-cyan-400 font-black py-4 rounded-xl text-lg transition-all border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] shadow-xl"');

// Replace "tier" screen UI
content = content.replace(/className="grid grid-cols-1 md:grid-cols-3 gap-6"/g, 'className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"');
content = content.replace(/className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2"/g, 'className="text-2xl md:text-3xl font-black text-slate-900 mb-2 flex items-center gap-3"');
content = content.replace(/className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-sky-500 hover:shadow-lg transition-all text-left group"/g, 'className="bg-white/40 backdrop-blur-xl border border-white/60 hover:border-white hover:bg-white/60 rounded-[24px] p-6 hover:shadow-xl transition-all text-left group shadow-[inset_0_1px_3px_rgba(255,255,255,0.7)]"');
content = content.replace(/className="text-sky-600 font-black mb-2"/g, 'className="text-teal-600 font-black mb-2"');
content = content.replace(/className="text-lg font-bold text-slate-900 mb-1"/g, 'className="text-lg font-bold text-slate-900 mb-1 group-hover:text-teal-700 transition-colors"');
content = content.replace(/className="w-8 h-8 text-sky-500"/g, 'className="w-8 h-8 text-teal-500"');

fs.writeFileSync('src/components/PatientConsultWidget.tsx', content);
console.log("Telemedicine UI upgraded");
