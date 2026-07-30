import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export async function GET() {
  try {
    const snap = await getDocs(query(collection(db, 'directory'), limit(10)));
    let results = [];
    for (const d of snap.docs) {
      const data = d.data();
      if (data.rawImages && data.rawImages.length > 0) {
         results.push({ name: data.name, images: data.rawImages });
      }
    }
    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
