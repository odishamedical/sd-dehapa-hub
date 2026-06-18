const fs = require('fs');
let code = fs.readFileSync('src/app/portal/doctor/page.tsx', 'utf8');

// 1. Add galleryData to bindings
code = code.replace(
    /if \(data\.specialties\) setSpecialtiesData\(data\.specialties\);/g,
    'if (data.specialties) setSpecialtiesData(data.specialties);\n          if (data.galleryImages) setGalleryData(data.galleryImages);'
);

// 2. Add galleryData state
code = code.replace(
    /const identitySaveStatus = useAutosave\(identityData, doctorUid, "basicInfo", 1000\);/g,
    'const identitySaveStatus = useAutosave(identityData, doctorUid, "basicInfo", 1000);\n\n  // Gallery State\n  const [galleryData, setGalleryData] = useState<string[]>([]);\n  const gallerySaveStatus = useAutosave(galleryData, doctorUid, "galleryImages", 1000);'
);

// 3. Add MultiImageUploader UI
const targetUi = 'Save Identity Info</button>\\s*</div>\\s*</div>\\s*</div>\\s*\\)}';
const newUiRegex = new RegExp(targetUi, 'g');

const replacementUi = `Save Identity Info</button>
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
        )}`;

code = code.replace(newUiRegex, replacementUi);

fs.writeFileSync('src/app/portal/doctor/page.tsx', code, 'utf8');
console.log("Patched successfully!");
