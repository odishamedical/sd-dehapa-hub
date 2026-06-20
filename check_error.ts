import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCryRvJ1gTdsd4Fb6BX9gwnFmss0W9qTt4",
  authDomain: "sd-dehapa.firebaseapp.com",
  projectId: "sd-dehapa",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  console.log("Checking whatsapp_debug_logs...");
  const qLogs = query(collection(db, 'whatsapp_debug_logs'));
  const snapLogs = await getDocs(qLogs);
  const docs = [];
  snapLogs.forEach(d => docs.push({ id: d.id, data: d.data() }));
  docs.sort((a, b) => b.id.localeCompare(a.id));
  
  docs.slice(0, 15).forEach(d => {
    console.log('LOG:', d.id, JSON.stringify(d.data, null, 2));
  });
  console.log('Done.');
  process.exit(0);
}

check().catch(console.error);
