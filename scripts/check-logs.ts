import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, getDocs, orderBy, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: "sd-auth-center.firebaseapp.com",
  projectId: "sd-auth-center"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkLogs() {
  console.log('Fetching whatsapp logs...');
  const logsRef = collection(db, 'whatsapp_debug_logs');
  const q = query(logsRef, limit(3));
  
  try {
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log('No logs found.');
      return;
    }
    snapshot.forEach(doc => {
      console.log('Log ID:', doc.id);
      console.log('Data:', JSON.stringify(doc.data(), null, 2));
      console.log('---');
    });
  } catch(e) {
    console.error(e);
  }
}

checkLogs();
