const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, limit, setDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: "sd-auth-center.firebaseapp.com",
  projectId: "sd-auth-center",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    await setDoc(doc(db, 'whatsapp_sessions', 'test_write'), { state: 'TEST' });
    console.log("Write successful!");
  } catch(e) {
    console.error("Write failed:", e);
  }
}
run();
