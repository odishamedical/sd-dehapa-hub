const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sd-auth-center.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sd-auth-center",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const q = query(collection(db, 'users'), where('email', '==', 'amaarhalchal@gmail.com'));
  const snap = await getDocs(q);
  console.log("Users found:", snap.size);
  snap.forEach(doc => {
    console.log(doc.id, "=>", doc.data().role);
  });
  
  const q2 = query(collection(db, 'doctor_applications'), where('userEmail', '==', 'amaarhalchal@gmail.com'));
  const snap2 = await getDocs(q2);
  console.log("Apps found:", snap2.size);
  snap2.forEach(doc => {
    console.log(doc.id, "=> status:", doc.data().status, "appType missing?", doc.data().appType);
  });
}
check();
