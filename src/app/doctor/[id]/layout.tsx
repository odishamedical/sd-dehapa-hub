import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const unwrappedParams = await params;
  
  try {
    const { getDoc, doc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');
    const docRef = doc(db, 'directory', unwrappedParams.id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const title = `${data.name} | DehaPa Connect`;
      const description = `${data.name} is a verified ${data.category || data.specialty || 'medical provider'} located in ${data.city || 'your area'}. Connect on DehaPa to book appointments and access records.`;
      
      let imageUrl = "https://odishamedical.com/logo.png"; // Fallback logo
      if (data.galleryImages && data.galleryImages.length > 0) {
        imageUrl = data.galleryImages[0];
      } else if (data.image) {
        imageUrl = data.image;
      } else if (data.rawImages && data.rawImages.length > 0) {
        imageUrl = data.rawImages[0];
      }

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `https://dehapa.com/doctor/${unwrappedParams.id}`,
          siteName: 'DehaPa',
          images: [
            {
              url: imageUrl,
              width: 800,
              height: 600,
            },
          ],
          locale: 'en_US',
          type: 'profile',
        },
      };
    }
  } catch (e) {
    console.error("Error generating metadata", e);
  }

  return {
    title: 'Doctor Profile | DehaPa',
  };
}

export default function DoctorProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
