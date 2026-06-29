import { Metadata, ResolvingMetadata } from 'next';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

type Props = {
  params: { type: string; id: string };
  children: React.ReactNode;
};

// This layout acts as a Server Component wrapper that fetches the profile 
// and injects Open Graph (OG) metadata before rendering the client page.
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { type, id } = params;
  
  // Default values
  let title = "Dehapa Profile";
  let description = "View this profile on the Dehapa Healthcare Network.";
  let imageUrl = "https://dehapa.com/default-og.jpg"; // Fallback image

  try {
    const docRef = doc(db, 'directory', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      title = `${data.name} | Dehapa Verified`;
      description = data.about || data.bio || data.subtitle || description;
      imageUrl = data.image || data.avatar || imageUrl;
    } else {
      // For mock data fallback when DB fails or doesn't have it (like in page.tsx)
      if (id === 'dr-deepak-kumar-parida') {
        title = "Dr. Deepak Kumar Parida | Dehapa Verified";
        description = "Senior Consultant Surgical Oncology based in Bhubaneswar, Odisha.";
        imageUrl = "/images/drdeepak.jpg";
      } else if (id === 'dr-sunil-sharma') {
        title = "Dr. Sunil Kumar Sharma | Dehapa Verified";
        description = "Professor & Senior Consultant Cardiologist.";
        imageUrl = "/images/drsunilsharma.PNG";
      }
    }
  } catch (error) {
    console.error("Failed to generate metadata for profile:", error);
  }

  // Ensure absolute URL for OG image if it's relative
  if (imageUrl.startsWith('/')) {
    imageUrl = `https://dehapa.com${imageUrl}`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function ProfileLayout({ children }: Props) {
  return (
    <>
      {children}
    </>
  );
}
