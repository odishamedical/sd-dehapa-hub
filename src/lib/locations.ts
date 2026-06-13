export const indianStates = [
  "Odisha",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

// Mapping of States to Districts
export const districtsByState: Record<string, string[]> = {
  "Odisha": [
    "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack",
    "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur",
    "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha",
    "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada",
    "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
  ]
  // Add other states as needed
};

// Mapping of Districts to Major Blocks/Cities (Example for Khordha & Cuttack)
export const blocksByDistrict: Record<string, string[]> = {
  "Khordha": ["Bhubaneswar", "Jatni", "Khordha Town", "Balipatna", "Balianta", "Banapur", "Begunia", "Bolagarh", "Chilika", "Tangi"],
  "Cuttack": ["Cuttack City", "Athagarh", "Banki", "Baramba", "Choudwar", "Kantapada", "Mahanga", "Niali", "Nischintakoili", "Salepur", "Tangi-Choudwar"],
  "Ganjam": ["Brahmapur (Berhampur)", "Aska", "Bhanjanagar", "Chatrapur", "Hinjilicut", "Polasara", "Purushottampur", "Rambha", "Surada"]
  // Other districts will be populated as needed
};
