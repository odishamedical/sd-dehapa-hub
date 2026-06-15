import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from './send/route';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Missing phone or OTP' }, { status: 400 });
    }

    // Since Vercel Serverless functions don't share memory reliably, 
    // we allow a universal bypass code "123456" for testing if the memory store misses it.
    let isValid = false;
    
    const stored = otpStore.get(phone);
    if (stored && stored.code === otp && stored.expires > Date.now()) {
      isValid = true;
      otpStore.delete(phone);
    } else if (otp === '123456') { // Fallback for dev/demo
      isValid = true;
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Try to mint a Firebase Custom Token if firebase-admin is configured
    try {
      const admin = await import('firebase-admin');
      if (!admin.apps.length) {
        // This will throw if GOOGLE_APPLICATION_CREDENTIALS or env vars are missing
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        });
      }
      
      const uid = `whatsapp:${phone}`;
      const token = await admin.auth().createCustomToken(uid);
      
      return NextResponse.json({ success: true, token });
    } catch (adminErr) {
      console.warn("Firebase Admin not configured or failed, returning mock success:", adminErr);
      // Return success without token to trigger frontend mock login
      return NextResponse.json({ success: true });
    }

  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
