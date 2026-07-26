const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

const dehapaConfig = { projectId: "sd-dehapa" };
const appDehapa = initializeApp(dehapaConfig, "dehapa");
const dbDehapa = getFirestore(appDehapa);

async function check() {
  try {
    const leadRef = doc(dbDehapa, 'outreach_leads', '917683811120');
    const snap = await getDoc(leadRef);
    if (snap.exists()) {
      console.log("LEAD FOUND in sd-dehapa:", snap.data());
    } else {
      console.log("LEAD NOT FOUND in sd-dehapa for 917683811120");
    }
  } catch(e) { console.log("error:", e.message); }

  try {
    const authConfig = { projectId: "sd-auth-center" };
    const appAuth = initializeApp(authConfig, "auth");
    const dbAuth = getFirestore(appAuth);
    const leadRefAuth = doc(dbAuth, 'outreach_leads', '917683811120');
    const snapAuth = await getDoc(leadRefAuth);
    if (snapAuth.exists()) {
      console.log("LEAD FOUND in sd-auth-center:", snapAuth.data());
    } else {
      console.log("LEAD NOT FOUND in sd-auth-center");
    }
  } catch(e) { console.log("error:", e.message); }
}
check();
