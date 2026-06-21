import { db } from './src/lib/firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

async function check() {
  const q = query(collection(db, 'directory'), where('ownerEmail', '==', 'npfcodisha@gmail.com'));
  const snap = await getDocs(q);
  console.log(`Found ${snap.size} directory entries for npfcodisha@gmail.com`);
  snap.forEach(doc => {
    console.log(doc.id, doc.data().verified, doc.data().category);
  });
  process.exit(0);
}
check();
