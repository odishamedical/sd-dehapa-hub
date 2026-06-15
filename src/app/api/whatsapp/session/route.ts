import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function PATCH(req: NextRequest) {
  try {
    const { phoneNumber, state } = await req.json();

    if (!phoneNumber || !state) {
      return NextResponse.json({ error: 'Missing phoneNumber or state' }, { status: 400 });
    }

    const sessionRef = doc(db, 'whatsapp_sessions', phoneNumber);
    await setDoc(sessionRef, { state }, { merge: true });

    return NextResponse.json({ success: true, state });
  } catch (error: any) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
