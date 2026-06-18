const fs = require('fs');

let content = fs.readFileSync('src/app/portal/doctor/page.tsx', 'utf8');

// 1. Add getDoc to imports
if (!content.includes('getDoc')) {
  content = content.replace(/import \{ doc, updateDoc \} from 'firebase\/firestore';/, "import { doc, updateDoc, getDoc } from 'firebase/firestore';");
}

// 2. Change all useState initializers to empty/defaults
content = content.replace(/const \[qualificationsData, setQualificationsData\] = useState\(\[\s*\{\s*degreeName: "MBBS",\s*passingYear: "2010",\s*collegeId: "",\s*collegeName: "SCB Medical College"\s*\}\s*\]\);/g, 'const [qualificationsData, setQualificationsData] = useState<any[]>([]);');

content = content.replace(/const \[identityData, setIdentityData\] = useState\(\{[\s\S]*?\}\);/g, `const [identityData, setIdentityData] = useState({
    profilePhoto: "",
    fullName: "",
    phone: "",
    whatsappNumber: "",
    specialityId: "",
    specialityName: ""
  });`);

content = content.replace(/const \[locationAddress, setLocationAddress\] = useState<AddressData>\(\{[\s\S]*?\}\);/g, `const [locationAddress, setLocationAddress] = useState<AddressData>({
    country: "India",
    state: "Odisha",
    district: "",
    block: "",
    city: "",
    pincode: "",
    localAddress: ""
  });`);

content = content.replace(/const \[experienceData, setExperienceData\] = useState\(\[\s*\{\s*hospitalId: "",\s*hospitalName: "Apollo Hospitals",\s*position: "Head of Cardiology",\s*duration: "2015-2020"\s*\}\s*\]\);/g, 'const [experienceData, setExperienceData] = useState<any[]>([]);');

content = content.replace(/const \[researchData, setResearchData\] = useState\(\[\s*\{\s*paperTitle: "",\s*journalId: "",\s*journalName: "",\s*publicationYear: ""\s*\}\s*\]\);/g, 'const [researchData, setResearchData] = useState<any[]>([]);');

content = content.replace(/const \[membershipsData, setMembershipsData\] = useState\(\[\s*\{\s*associationId: "",\s*associationName: "",\s*role: ""\s*\}\s*\]\);/g, 'const [membershipsData, setMembershipsData] = useState<any[]>([]);');

content = content.replace(/const \[awardsData, setAwardsData\] = useState\(\[\s*\{\s*awardName: "",\s*awardingBody: "",\s*year: ""\s*\}\s*\]\);/g, 'const [awardsData, setAwardsData] = useState<any[]>([]);');

content = content.replace(/const \[specialtiesData, setSpecialtiesData\] = useState<\{ id: string; name: string; isPrimary: boolean \}\[]>\(\[\s*\{\s*id: '1', name: 'Cardiology', isPrimary: true\s*\},\s*\{\s*id: '2', name: 'Interventional Cardiology', isPrimary: false\s*\}\s*\]\);/g, 'const [specialtiesData, setSpecialtiesData] = useState<{ id: string; name: string; isPrimary: boolean }[]>([]);');

content = content.replace(/const \[bookingsData, setBookingsData\] = useState\(\{[\s\S]*?\}\);/g, `const [bookingsData, setBookingsData] = useState({
    appointmentType: "Video Consultation",
    duration: "15 Mins",
    noticePeriod: "1 Hour"
  });`);

// 3. Add loading state and fetched profile data state
if (!content.includes('const [isProfileLoaded, setIsProfileLoaded] = useState(false);')) {
  content = content.replace(/const \[doctorUid, setDoctorUid\] = useState<string \| null>\(null\);/, `const [doctorUid, setDoctorUid] = useState<string | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);`);
}

// 4. Update the existing useEffect to fetch data
const newUseEffect = `React.useEffect(() => {
    if (typeof window !== "undefined") {
      const uid = localStorage.getItem("sd_current_user_uid") || localStorage.getItem("sd_current_user_email");
      if (!uid) {
        window.location.href = "/login";
      } else {
        setDoctorUid(uid);
      }
    }
  }, []);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!doctorUid) return;
      try {
        const docRef = doc(db, 'directory', doctorUid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          
          if (data.basicInfo) setIdentityData(data.basicInfo);
          if (data.qualifications) setQualificationsData(data.qualifications);
          if (data.locationAddress) setLocationAddress(data.locationAddress);
          if (data.experience) setExperienceData(data.experience);
          if (data.research) setResearchData(data.research);
          if (data.memberships) setMembershipsData(data.memberships);
          if (data.awards) setAwardsData(data.awards);
          if (data.specialties) setSpecialtiesData(data.specialties);
          // bindings
        }
      } catch (err) {
        console.error("Failed to fetch doctor profile", err);
      } finally {
        setIsProfileLoaded(true);
      }
    };
    fetchProfile();
  }, [doctorUid]);`;

content = content.replace(/React\.useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/, newUseEffect);

// 5. Update userProfile in DashboardLayout to use dynamic data
const userProfileStr = `userProfile={{
          name: profileData?.basicInfo?.fullName || profileData?.name || "Dr. Unnamed Profile",
          subtitle: profileData?.basicInfo?.specialityName || profileData?.speciality || "Update your identity info",
          image: profileData?.basicInfo?.profilePhoto || profileData?.image || null
        }}`;
content = content.replace(/userProfile=\{\{[\s\S]*?\}\}/, userProfileStr);

// 6. Calculate dynamic strength and actions
if (!content.includes('const calculateProfileStrength')) {
  const dynamicMetricsStr = `
  // Dynamic Profile Metrics
  const calculateProfileStrength = () => {
    let score = 0;
    if (identityData?.fullName) score += 20;
    if (identityData?.profilePhoto) score += 20;
    if (identityData?.phone) score += 10;
    if (qualificationsData?.length > 0) score += 25;
    if (locationAddress?.city) score += 25;
    return score;
  };
  
  const getPendingActions = () => {
    const actions = [];
    if (!identityData?.fullName) actions.push({ id: 'a1', label: 'Add Full Name', tabId: 'identity' });
    if (!identityData?.profilePhoto) actions.push({ id: 'a2', label: 'Upload Profile Photo', tabId: 'identity' });
    if (!qualificationsData || qualificationsData.length === 0) actions.push({ id: 'a3', label: 'Add Qualifications', tabId: 'qualifications' });
    if (!locationAddress?.city) actions.push({ id: 'a4', label: 'Add Practice Locations', tabId: 'locations' });
    return actions;
  };
  
  const getCompletedActions = () => {
    const actions = [];
    if (identityData?.fullName) actions.push({ id: 'c1', label: 'Identity Information Added' });
    if (identityData?.profilePhoto) actions.push({ id: 'c2', label: 'Profile Photo Uploaded' });
    if (qualificationsData?.length > 0) actions.push({ id: 'c3', label: 'Qualifications Added' });
    if (locationAddress?.city) actions.push({ id: 'c4', label: 'Locations Added' });
    return actions;
  };
  
  if (!doctorUid || !isProfileLoaded) {
    return (
      <div className="min-h-screen bg-[#040815] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
`;

  content = content.replace(/if \(\!doctorUid\) return null;/, dynamicMetricsStr);
}

// 7. Update DashboardHomeGrid mock metrics
content = content.replace(/profileStrength=\{35\}/, 'profileStrength={calculateProfileStrength()}');
content = content.replace(/pendingActions=\{\[[\s\S]*?\]\}/, 'pendingActions={getPendingActions()}');
content = content.replace(/completedActions=\{\[[\s\S]*?\]\}/, 'completedActions={getCompletedActions()}');

fs.writeFileSync('src/app/portal/doctor/page.tsx', content);
console.log("Mock data removed and Firebase hydration added.");
