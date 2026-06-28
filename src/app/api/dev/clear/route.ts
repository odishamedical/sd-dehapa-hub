import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const q = query(collection(db, 'consultation_requests'), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    
    let count = 0;
    for (const doc of snapshot.docs) {
      await updateDoc(doc.ref, { status: 'completed' });
      count++;
    }
    
    return NextResponse.json({ success: true, cleared: count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
