const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src/components/views');

const doctorFile = fs.readFileSync(path.join(viewsDir, 'DoctorListingView.tsx'), 'utf8');

// We need to extract the Hero UI and the Sidebar UI from DoctorListingView
// Hero starts at: {/* Premium Hero Search */}
// Hero ends at: {/* Left Sidebar Filters - 25% */} (exclusive)
// Sidebar starts at: {/* Left Sidebar Filters - 25% */}
// Sidebar ends at: {/* Right Content - 75% */} (exclusive)

const heroRegex = /\{\/\* Premium Hero Search \*\/\}(.*?)\{\/\* Left Sidebar Filters - 25% \*\/\}/s;
const heroMatch = doctorFile.match(heroRegex);
const heroContent = heroMatch ? heroMatch[1] : '';

const sidebarRegex = /\{\/\* Left Sidebar Filters - 25% \*\/\}(.*?)\{\/\* Right Content - 75% \*\/\}/s;
const sidebarMatch = doctorFile.match(sidebarRegex);
let sidebarContent = sidebarMatch ? sidebarMatch[1] : '';

// Function to update a view
function updateView(filename, entityPlural, description, searchPlaceholder, ticketUI) {
  const filePath = path.join(viewsDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');

  // We need to reconstruct the return statement.
  // We'll replace everything from `return (` to the end with a new structure.
  
  const returnRegex = /return \(\s*<div className="min-h-screen.*$/s;
  
  // Customizing Hero for this entity
  let customHero = heroContent.replace('DehaPa.com : <span className="text-teal-400">Your Health Our Mission</span>', `Find a <span className="text-teal-400">${entityPlural.slice(0,-1)}</span>`);
  customHero = customHero.replace('Connect with renowned specialists through secure video consultations or physical appointments.', description);
  customHero = customHero.replace('placeholder="e.g. Dr Abhishek, Kalinga Hospital..."', `placeholder="${searchPlaceholder}"`);
  
  let newReturn = `return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-teal-500/30">
      <CategoryNav />
      
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm relative z-20">
        <div className="w-full max-w-[1920px] mx-auto">
          <Breadcrumb paths={[
            { name: "Home", href: "/" },
            { name: "${entityPlural}", href: "/${entityPlural.toLowerCase()}" },
            ...(initialCountry ? [{ name: initialCountry.charAt(0).toUpperCase() + initialCountry.slice(1), href: \`/${entityPlural.toLowerCase()}/\${initialCountry}\` }] : []),
            ...(initialState ? [{ name: initialState.charAt(0).toUpperCase() + initialState.slice(1), href: \`/${entityPlural.toLowerCase()}/\${initialCountry}/\${initialState}\` }] : []),
            ...(initialDistrict ? [{ name: initialDistrict.charAt(0).toUpperCase() + initialDistrict.slice(1) }] : [])
          ]} />
        </div>
      </div>

      {/* Premium Hero Search */}
${customHero}
      {/* Left Sidebar Filters - 25% */}
${sidebarContent}
      {/* Right Content - 75% */}
          <div className="w-full lg:w-3/4 flex flex-col gap-6">
            ${ticketUI}
          </div>
        </div>
      </main>
      {showProfileBlocker && (
        <ProfileBlockerModal onClose={() => setShowProfileBlocker(false)} />
      )}
    </div>
  );
}
`;

  // We need to extract the existing tickets logic from the file so we don't lose it.
  // In existing files, the tickets are usually after `{/* Directory Grid */}` or similar.
  // Actually, wait, let's just use the exact ticket mapping they have currently.
  
  let existingTicketsRegex = /\{filtered[a-zA-Z]+.length > 0 \? \((.*?)\) : \(/s;
  let existingTicketsMatch = content.match(existingTicketsRegex);
  
  let emptyStateRegex = /\) : \(\s*(<div className="col-span-full.*?<\/div>)\s*\)/s;
  let emptyStateMatch = content.match(emptyStateRegex);
  
  let fallbackTickets = `{filtered${entityPlural}.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {filtered${entityPlural}.map(doc => (
         <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200">
           {/* Fallback Ticket */}
           <h3 className="font-bold">{doc.name}</h3>
         </div>
       ))}
    </div>
  ) : (
    <div className="col-span-full text-center py-20 bg-slate-50 border border-slate-200 rounded-2xl">
      <p className="text-slate-600 font-bold uppercase">No records found</p>
    </div>
  )}`;

  let finalTicketUI = fallbackTickets;
  if (existingTicketsMatch && emptyStateMatch) {
    let mapping = existingTicketsMatch[1];
    let empty = emptyStateMatch[1];
    finalTicketUI = `{filtered${entityPlural}.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        ${mapping}
      </div>
    ) : (
      ${empty}
    )}`;
  } else if (content.includes('filteredHospitals.map')) {
    // Custom extract for hospital
    let m = content.split('{filteredHospitals.length > 0 ? (')[1];
    if (m) {
      let mapping = m.split(') : (')[0];
      let empty = m.split(') : (')[1].split(')}')[0];
      finalTicketUI = `{filteredHospitals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          ${mapping}
        </div>
      ) : (
        ${empty}
      )}`;
    }
  }

  // Same for other entities...
  if (entityPlural === 'Labs') {
     let m = content.split('{filteredLabs.length > 0 ? (')[1];
     if (m) {
       let mapping = m.split(') : (')[0];
       let empty = m.split(') : (')[1].split(')}')[0];
       finalTicketUI = `{filteredLabs.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           ${mapping}
         </div>
       ) : (
         ${empty}
       )}`;
     }
  }
  if (entityPlural === 'Pharmacies') {
     let m = content.split('{filteredPharmacies.length > 0 ? (')[1];
     if (m) {
       let mapping = m.split(') : (')[0];
       let empty = m.split(') : (')[1].split(')}')[0];
       finalTicketUI = `{filteredPharmacies.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           ${mapping}
         </div>
       ) : (
         ${empty}
       )}`;
     }
  }
  if (entityPlural === 'Ambulances') {
     let m = content.split('{filteredAmbulances.length > 0 ? (')[1];
     if (m) {
       let mapping = m.split(') : (')[0];
       let empty = m.split(') : (')[1].split(')}')[0];
       finalTicketUI = `{filteredAmbulances.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           ${mapping}
         </div>
       ) : (
         ${empty}
       )}`;
     }
  }

  // Generate new return
  let finalReturn = newReturn.replace('${ticketUI}', finalTicketUI);

  const updatedContent = content.replace(returnRegex, finalReturn);
  
  // also add CustomDropdown import if missing
  let u2 = updatedContent;
  if (!u2.includes("import CustomDropdown")) {
    u2 = u2.replace("import CategoryNav from '@/components/CategoryNav';", "import CategoryNav from '@/components/CategoryNav';\nimport CustomDropdown from '@/components/CustomDropdown';");
  }

  fs.writeFileSync(filePath, u2, 'utf8');
  console.log(`Updated ${filename}`);
}

updateView('HospitalListingView.tsx', 'Hospitals', 'Book a secure FHIR-compliant video consultation with top medical experts.', 'e.g. Apollo, KIMS...', '');
updateView('LabListingView.tsx', 'Labs', 'Find accredited diagnostic centers and pathology labs near you.', 'e.g. Dr Lal PathLabs...', '');
updateView('PharmacyListingView.tsx', 'Pharmacies', 'Locate 24/7 pharmacies and order authentic medicines.', 'e.g. Apollo Pharmacy...', '');
updateView('AmbulanceListingView.tsx', 'Ambulances', 'Book emergency and ICU-equipped ambulances instantly.', 'e.g. 108, ALS Ambulance...', '');

console.log("ALL VIEWS UPDATED SUCCESSFULLY");
