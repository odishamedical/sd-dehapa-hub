const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const dehapaConfig = { projectId: "sd-dehapa" };
const appDehapa = initializeApp(dehapaConfig, "dehapa");
const dbDehapa = getFirestore(appDehapa);

async function check() {
  try {
    const q1 = await getDocs(collection(dbDehapa, "whatsapp_debug_logs"));
    console.log("sd-dehapa whatsapp_debug_logs count:", q1.size);
    q1.forEach(doc => {
      if (doc.id.includes('WEBHOOK')) {
        console.log(doc.id, "=>", doc.data());
      }
    });
  } catch(e) { console.log("whatsapp_debug_logs error:", e.message); }
}
check();
