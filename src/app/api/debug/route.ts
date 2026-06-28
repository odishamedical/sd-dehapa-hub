import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function GET() {
  try {
    const snap = await getDocs(collection(db, 'directory'));
    let updatedCount = 0;
    for (const d of snap.docs) {
      const data = d.data();
      if (data.customSlug && typeof data.customSlug === 'string' && data.customSlug !== data.customSlug.trim()) {
        await updateDoc(doc(db, 'directory', d.id), { customSlug: data.customSlug.trim() });
        updatedCount++;
      }
    }
    return NextResponse.json({ success: true, updatedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
