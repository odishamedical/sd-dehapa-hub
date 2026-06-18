const fs = require('fs');
let code = fs.readFileSync('src/app/profile/[type]/[id]/page.tsx', 'utf8');

if (!code.includes('HorizontalScrollGallery')) {
    code = code.replace(
        "import Link from 'next/link';",
        "import Link from 'next/link';\nimport HorizontalScrollGallery from '@/components/HorizontalScrollGallery';"
    );
}

// Replace useEffect
const oldUseEffect = `  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setProfile(getMockProfile(unwrappedParams.type, unwrappedParams.id));
    }, 500);
    return () => clearTimeout(timer);
  }, [unwrappedParams.type, unwrappedParams.id]);`;

const newUseEffect = `  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const docRef = doc(db, 'directory', unwrappedParams.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            ...data,
            name: data.name || data.basicInfo?.fullName || "Unnamed",
            subtitle: data.category || data.basicInfo?.specialityName || "Medical Professional",
            image: data.image || data.basicInfo?.profilePhoto || "",
            about: data.about || data.description || "No description provided.",
            stats: { rating: "4.5", status: "Active" },
            details: [],
            roster: [],
            verified: data.verified || false,
            galleryImages: data.galleryImages || [],
            rawImages: data.rawImages || []
          });
          return;
        }
      } catch(err) {
        console.log("Failed to fetch from DB, falling back to mock", err);
      }
      setProfile(getMockProfile(unwrappedParams.type, unwrappedParams.id));
    };
    fetchProfile();
  }, [unwrappedParams.type, unwrappedParams.id]);`;

code = code.replace(oldUseEffect, newUseEffect);
code = code.replace(oldUseEffect.replace(/\r\n/g, '\n'), newUseEffect);

// Replace About section
const oldAbout = `              <p className="text-slate-600 leading-relaxed text-lg">{profile.about}</p>
            </section>`;

const newAbout = `              <p className="text-slate-600 leading-relaxed text-lg">{profile.about}</p>
            </section>
            
            <HorizontalScrollGallery images={profile.galleryImages?.length > 0 ? profile.galleryImages : (profile.rawImages || [])} />`;

code = code.replace(oldAbout, newAbout);
code = code.replace(oldAbout.replace(/\r\n/g, '\n'), newAbout);

fs.writeFileSync('src/app/profile/[type]/[id]/page.tsx', code, 'utf8');
console.log("Profile Patched");
