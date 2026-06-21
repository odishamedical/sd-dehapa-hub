import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const appsSnap = await getDocs(collection(db, 'doctor_applications'));
    const apps = appsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    const usersSnap = await getDocs(collection(db, 'users'));
    const users = usersSnap.docs.map(d => ({ id: d.id, email: d.data().email, role: d.data().role }));
    
    return NextResponse.json({ apps, users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
