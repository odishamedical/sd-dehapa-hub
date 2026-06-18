const fs = require('fs');

let code = fs.readFileSync('src/components/PatientConsultWidget.tsx', 'utf8');

// Add getDoc to imports
if (!code.includes('getDoc')) {
  code = code.replace('collection, addDoc, doc, onSnapshot', 'collection, addDoc, doc, onSnapshot, getDoc');
}

// Replace static tiers with state
const staticTiers = `  const tiers = [
    { id: 'General Doctor', name: 'General Physician', price: 299, desc: 'Fever, cold, basic medical advice.' },
    { id: 'Specialist Doctor', name: 'Specialist', price: 599, desc: 'Dermatologist, Pediatrician, Orthopedist, etc.' },
    { id: 'Super-specialist Doctor', name: 'Super Specialist', price: 999, desc: 'Cardiologist, Neurologist, Oncologist, etc.' }
  ];`;

const dynamicTiers = `  const [tiers, setTiers] = useState([
    { id: 'General Doctor', name: 'General Physician', price: 299, desc: 'Fever, cold, basic medical advice.' },
    { id: 'Specialist Doctor', name: 'Specialist', price: 599, desc: 'Dermatologist, Pediatrician, Orthopedist, etc.' },
    { id: 'Super-specialist Doctor', name: 'Super Specialist', price: 999, desc: 'Cardiologist, Neurologist, Oncologist, etc.' }
  ]);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const docRef = doc(db, 'platform_settings', 'pricing');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTiers([
            { id: 'General Doctor', name: 'General Physician', price: data.generalPhysician || 299, desc: 'Fever, cold, basic medical advice.' },
            { id: 'Specialist Doctor', name: 'Specialist', price: data.specialist || 599, desc: 'Dermatologist, Pediatrician, Orthopedist, etc.' },
            { id: 'Super-specialist Doctor', name: 'Super Specialist', price: data.superSpecialist || 999, desc: 'Cardiologist, Neurologist, Oncologist, etc.' }
          ]);
        }
      } catch (err) {
        console.error("Failed to load live pricing", err);
      }
    }
    fetchPricing();
  }, []);`;

if (code.includes(staticTiers)) {
  code = code.replace(staticTiers, dynamicTiers);
}

fs.writeFileSync('src/components/PatientConsultWidget.tsx', code);
console.log('Successfully updated PatientConsultWidget.tsx');
