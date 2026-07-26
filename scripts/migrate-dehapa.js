const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, setDoc, doc } = require('firebase/firestore');

const authConfig = { projectId: "sd-auth-center" };
const dehapaConfig = { projectId: "sd-dehapa" };

const appAuth = initializeApp(authConfig, "auth");
const dbAuth = getFirestore(appAuth);

const appDehapa = initializeApp(dehapaConfig, "dehapa");
const dbDehapa = getFirestore(appDehapa);

async function migrate() {
  console.log("Fetching directory from sd-auth-center...");
  const snap = await getDocs(collection(dbAuth, "directory"));
  console.log(`Found ${snap.size} documents in sd-auth-center.`);

  let count = 0;
  for (const document of snap.docs) {
    const data = document.data();
    await setDoc(doc(dbDehapa, "directory", document.id), data);
    count++;
    if (count % 10 === 0) console.log(`Migrated ${count}...`);
  }
  console.log(`Successfully migrated ${count} directory entries to sd-dehapa!`);

  console.log("Fetching outreach_leads from sd-auth-center...");
  const leadsSnap = await getDocs(collection(dbAuth, "outreach_leads"));
  console.log(`Found ${leadsSnap.size} outreach_leads in sd-auth-center.`);
  let leadsCount = 0;
  for (const document of leadsSnap.docs) {
    await setDoc(doc(dbDehapa, "outreach_leads", document.id), document.data());
    leadsCount++;
  }
  console.log(`Successfully migrated ${leadsCount} outreach_leads to sd-dehapa!`);
}

migrate().then(() => process.exit(0)).catch(e => {
  console.error("Migration failed:", e);
  process.exit(1);
});
