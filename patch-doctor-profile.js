const fs = require('fs');
let code = fs.readFileSync('src/components/views/DoctorProfileView.tsx', 'utf8');

if (!code.includes('HorizontalScrollGallery')) {
    code = code.replace(
        "import Link from 'next/link';",
        "import Link from 'next/link';\nimport HorizontalScrollGallery from '@/components/HorizontalScrollGallery';"
    );
}

// Remove old gallery from locations tab
const oldGalleryStr = `                {/* Image Gallery (Horizontal Scroll) */}
                {doctor.galleryImages?.length > 0 && (
                  <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-8 border border-slate-700/50 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 font-serif flex items-center gap-3">
                      <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      Clinic Facilities
                    </h2>
                    <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
                      {doctor.galleryImages.map((img: string, idx: number) => (
                        <div key={idx} className="min-w-[280px] md:min-w-[320px] h-48 md:h-64 rounded-2xl overflow-hidden snap-center border border-slate-700/50 shrink-0 group cursor-pointer relative">
                          <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/20 transition-colors z-10"></div>
                          <img src={img} alt={\`Clinic Photo \${idx + 1}\`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}`;

// We can just regex replace it or use string replace, accounting for CRLF vs LF
code = code.replace(oldGalleryStr, '');
code = code.replace(oldGalleryStr.replace(/\n/g, '\r\n'), '');

// Insert the new HorizontalScrollGallery at the bottom
const bottomGridPattern = `
        </div>
      </div>
    </div>
  );
}`;

const newBottomGrid = `
        </div>
        
        {/* Full Width Bottom Gallery */}
        <div className="mt-12 w-full">
          <HorizontalScrollGallery images={doctor.galleryImages?.length > 0 ? doctor.galleryImages : (doctor.rawImages || [])} />
        </div>
      </div>
    </div>
  );
}`;

// The original has:
//           </div>
//
//         </div>
//       </div>
//     </div>
//   );
// }

const endTagPattern = `        </div>\n      </div>\n    </div>\n  );\n}`;
const endTagPatternWin = `        </div>\r\n      </div>\r\n    </div>\r\n  );\r\n}`;

const replaceWith = `        </div>\n        <div className="mt-12 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 relative z-20 pb-12">\n          <HorizontalScrollGallery images={doctor.galleryImages?.length > 0 ? doctor.galleryImages : (doctor.rawImages || [])} />\n        </div>\n      </div>\n    </div>\n  );\n}`;

code = code.replace(endTagPattern, replaceWith);
code = code.replace(endTagPatternWin, replaceWith.replace(/\n/g, '\r\n'));

// Add rawImages to the initial payload in fetchDoctor so it's available
code = code.replace(
    'galleryImages: rawData.galleryImages || [],',
    'galleryImages: rawData.galleryImages || [],\n            rawImages: rawData.rawImages || [],'
);

fs.writeFileSync('src/components/views/DoctorProfileView.tsx', code, 'utf8');
console.log("DoctorProfileView Patched");
