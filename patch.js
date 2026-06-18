const fs = require('fs');
let code = fs.readFileSync('src/app/portal/doctor/page.tsx', 'utf8');

code = code.replace(
    'if (data.specialties) setSpecialtiesData(data.specialties);',
    'if (data.specialties) setSpecialtiesData(data.specialties);\n          if (data.galleryImages) setGalleryData(data.galleryImages);'
);

code = code.replace(
    'const identitySaveStatus = useAutosave(identityData, doctorUid, "basicInfo", 1000);',
    'const identitySaveStatus = useAutosave(identityData, doctorUid, "basicInfo", 1000);\n\n  // Gallery State\n  const [galleryData, setGalleryData] = useState<string[]>([]);\n  const gallerySaveStatus = useAutosave(galleryData, doctorUid, "galleryImages", 1000);'
);

const new_ui = `              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button className="px-6 py-3 bg-[#0a1229] hover:bg-[#040815] text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold rounded-xl shadow-lg transition-all">Save Identity Info</button>
              </div>
            </div>
            
            {/* Gallery Uploader */}
            <div className="mt-12 border-t border-slate-200/60 pt-8">
              <MultiImageUploader 
                initialImages={galleryData} 
                providerId={doctorUid || ''}
                onUpload={(newUrls) => setGalleryData(prev => [...prev, ...newUrls])}
              />
            </div>
          </div>
        )`;

code = code.replace(
    '              <div className="flex justify-end pt-4 border-t border-slate-100">\r\n                <button className="px-6 py-3 bg-[#0a1229] hover:bg-[#040815] text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold rounded-xl shadow-lg transition-all">Save Identity Info</button>\r\n              </div>\r\n            </div>\r\n          </div>\r\n        )}',
    new_ui
).replace(
    '              <div className="flex justify-end pt-4 border-t border-slate-100">\n                <button className="px-6 py-3 bg-[#0a1229] hover:bg-[#040815] text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold rounded-xl shadow-lg transition-all">Save Identity Info</button>\n              </div>\n            </div>\n          </div>\n        )}',
    new_ui
);

fs.writeFileSync('src/app/portal/doctor/page.tsx', code, 'utf8');
