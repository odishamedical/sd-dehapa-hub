const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src/components/views');

const entities = ['Hospital', 'Lab', 'Pharmacy', 'Ambulance'];

for (const entity of entities) {
  const filePath = path.join(viewsDir, `${entity}ListingView.tsx`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add state variables
  if (!content.includes('const [selectedDistricts, setSelectedDistricts]')) {
    content = content.replace('const [loading, setLoading] = useState(true);', 
`const [loading, setLoading] = useState(true);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [searchDistrict, setSearchDistrict] = useState(initialDistrict);
  const [searchType, setSearchType] = useState("");`
    );
  }

  // Add uniqueDistricts right before return (
  if (!content.includes('const uniqueDistricts =')) {
    const listName = `${entity.toLowerCase()}s`;
    content = content.replace('return (', 
`const uniqueDistricts = Array.from(new Set(${listName}.map(d => d.district).filter(d => d !== "Unknown"))).sort();

  return (`
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${entity}`);
}

console.log("SUCCESS");
