const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

async function check() {
  const d = initializeApp({ projectId: "sd-dehapa" }, "d");
  const a = initializeApp({ projectId: "sd-auth-center" }, "a");
  
  const snap1 = await getDocs(collection(getFirestore(d), "whatsapp_debug_logs"));
  let d_latest = 0;
  snap1.forEach(doc => {
    if (doc.id.includes('WEBHOOK')) {
      const ts = parseInt(doc.id.split('_')[0]);
      if (ts > d_latest) d_latest = ts;
    }
  });
  console.log("sd-dehapa latest webhook ts:", d_latest, new Date(d_latest));

  try {
    const snap2 = await getDocs(collection(getFirestore(a), "whatsapp_debug_logs"));
    let a_latest = 0;
    snap2.forEach(doc => {
      if (doc.id.includes('WEBHOOK')) {
        const ts = parseInt(doc.id.split('_')[0]);
        if (ts > a_latest) a_latest = ts;
      }
    });
    console.log("sd-auth-center latest webhook ts:", a_latest, new Date(a_latest));
  } catch(e) { console.log("auth error:", e.message); }
}
check();
