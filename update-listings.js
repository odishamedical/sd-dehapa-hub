const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src/components/views');

// --- DoctorListingView ---
const doctorPath = path.join(viewsDir, 'DoctorListingView.tsx');
let doctorContent = fs.readFileSync(doctorPath, 'utf8');

// Remove the inline PremiumDoctorTicket (from const PremiumDoctorTicket to export const dynamic)
const doctorTicketRegex = /const PremiumDoctorTicket = \(\{ data \}: \{ data: any \}\) => \{[\s\S]*?export const dynamic = 'force-dynamic';/;
doctorContent = doctorContent.replace(doctorTicketRegex, "import PremiumEntityTicket from '@/components/PremiumEntityTicket';\n\nexport const dynamic = 'force-dynamic';");

// Replace usage
doctorContent = doctorContent.replace(/<PremiumDoctorTicket/g, '<PremiumEntityTicket type="doctors"');
fs.writeFileSync(doctorPath, doctorContent, 'utf8');
console.log('Updated DoctorListingView');

// --- Other Listings ---
const others = [
  { file: 'PharmacyListingView.tsx', type: 'pharmacies', arrName: 'filteredPharmacys' },
  { file: 'HospitalListingView.tsx', type: 'hospitals', arrName: 'filteredHospitals' },
  { file: 'LabListingView.tsx', type: 'labs', arrName: 'filteredLabs' },
  { file: 'AmbulanceListingView.tsx', type: 'ambulances', arrName: 'filteredAmbulances' }
];

others.forEach(o => {
  const p = path.join(viewsDir, o.file);
  let content = fs.readFileSync(p, 'utf8');
  
  // Add import if not exists
  if (!content.includes('PremiumEntityTicket')) {
    content = content.replace("import CustomDropdown from '@/components/CustomDropdown';", "import CustomDropdown from '@/components/CustomDropdown';\nimport PremiumEntityTicket from '@/components/PremiumEntityTicket';");
  }

  // The link block we want to replace starts with:
  // <Link href={generateUniversalSeoUrl(doc, 'pharmacies')} key={doc.id}
  // and ends right before:
  // ) : (
  
  const mapRegex = new RegExp(\`\\{\\s*\${o.arrName}\\.map\\(doc => \\([\\s\\S]*?\\)\\)\\s*\\} : \\(\`, 'g');
  
  content = content.replace(mapRegex, \`{\${o.arrName}.map(doc => (
                  <PremiumEntityTicket key={doc.id} data={doc} type="\${o.type}" />
                ))}
              ) : (\`);
              
  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated', o.file);
});
