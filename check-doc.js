const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "demo",
  authDomain: "demo.firebaseapp.com",
  projectId: "shyam-dash-creation",
  storageBucket: "shyam-dash-creation.appspot.com",
  messagingSenderId: "demo",
  appId: "demo"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDoctor() {
  const q = query(collection(db, 'directory'), where('name', '==', 'Dr Ramachandra Behera'));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    console.log(doc.id, " => ", doc.data());
  });
}
checkDoctor();
