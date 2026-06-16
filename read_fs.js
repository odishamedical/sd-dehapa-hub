const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs, query, limit, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCryRvJ1gTdsd4Fb6BX9gwnFmss0W9qTt4",
  authDomain: "sd-dehapa.firebaseapp.com",
  projectId: "sd-dehapa",
  storageBucket: "sd-dehapa.firebasestorage.app",
  messagingSenderId: "38504662881",
  appId: "1:38504662881:web:4bf6eae253cc42e457e720"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, 'directory'), where('type', '==', 'doctor'));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    console.log("ID:", doc.id);
    console.log("Slug:", doc.data().customSlug);
    console.log("Name:", doc.data().name);
  });
}

run().catch(console.error);
