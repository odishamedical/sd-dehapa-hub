import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  console.log("Checking whatsapp_debug_logs...");
  const qLogs = query(collection(db, 'whatsapp_debug_logs'), orderBy('__name__', 'desc'), limit(5));
  const snapLogs = await getDocs(qLogs);
  snapLogs.forEach(d => console.log('Log:', d.id));
  console.log('Total debug logs found:', snapLogs.size);

  console.log("\nChecking whatsapp_sessions...");
  const qSessions = query(collection(db, 'whatsapp_sessions'), limit(5));
  const snapSessions = await getDocs(qSessions);
  snapSessions.forEach(d => console.log('Session:', d.id, d.data()));
  console.log('Total sessions found:', snapSessions.size);
  
  process.exit(0);
}

check().catch(console.error);
