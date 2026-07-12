import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  try {
    const providerId = params.providerId;
    
    // Fetch provider's config from Firestore
    const docRef = doc(db, 'directory', providerId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return new NextResponse('Provider not found', { status: 404 });
    }
    
    const providerData = docSnap.data();
    const config = providerData.appConfig || {};
    
    // If not published, don't return a manifest to prevent installation
    if (!config.isPublished) {
      return new NextResponse('App not published', { status: 403 });
    }
    
    const appName = config.appName || providerData.name || 'My Clinic';
    const primaryColor = config.primaryColor || '#0ea5e9';
    // Fallback logo is the standard Dehapa logo if none is provided
    const logoUrl = config.logoUrl || providerData.logo || 'https://dehapa.com/icon-512x512.png';

    // Generate standard PWA manifest
    const manifest = {
      name: appName,
      short_name: appName.substring(0, 12),
      description: `Official patient portal for ${appName}`,
      start_url: `/app/${providerId}?source=pwa`,
      display: "standalone",
      background_color: "#f8fafc", // slate-50
      theme_color: primaryColor,
      icons: [
        {
          src: logoUrl,
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: logoUrl,
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    };

    return NextResponse.json(manifest, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120'
      }
    });
    
  } catch (error) {
    console.error('Error generating manifest:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
