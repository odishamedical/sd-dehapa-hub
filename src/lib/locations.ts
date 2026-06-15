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

// Mapping of Districts to Major Blocks/Cities (All 30 Odisha Districts)
export const blocksByDistrict: Record<string, string[]> = {
  "Angul": ["Angul Town", "Talcher", "Athamallik", "Banarpal", "Chhendipada", "Kaniha", "Kishorenagar", "Pallahara"],
  "Balangir": ["Balangir Town", "Titilagarh", "Patnagarh", "Agalpur", "Belpara", "Bongomunda", "Deogaon", "Gudvella", "Khaprakhol", "Loisingha", "Muribahal", "Puintala", "Saintala", "Turekela"],
  "Balasore": ["Balasore City", "Bahanaga", "Baliapal", "Basta", "Bhograi", "Jaleswar", "Khaira", "Nilagiri", "Oupada", "Remuna", "Simulia", "Soro"],
  "Bargarh": ["Bargarh Town", "Attabira", "Barpali", "Bhatli", "Bheden", "Bijepur", "Gaisilet", "Jharbandh", "Padampur", "Paikmal", "Rajborasambar", "Sohela"],
  "Bhadrak": ["Bhadrak Town", "Basudevpur", "Bhandaripokhari", "Bonth", "Chandabali", "Dhamnagar", "Tihidi"],
  "Boudh": ["Boudh Town", "Harbhanga", "Kantamal"],
  "Cuttack": ["Cuttack City", "Athagarh", "Banki", "Baramba", "Choudwar", "Kantapada", "Mahanga", "Niali", "Nischintakoili", "Salepur", "Tangi-Choudwar"],
  "Deogarh": ["Deogarh Town", "Barkote", "Reamal", "Tileibani"],
  "Dhenkanal": ["Dhenkanal Town", "Bhuban", "Gondia", "Hindol", "Kamakhyanagar", "Kankadahad", "Odapada", "Parjang"],
  "Gajapati": ["Paralakhemundi", "Gosani", "Gumma", "Kashinagar", "Mohana", "Nuagada", "R.Udaygiri", "Rayagada Block"],
  "Ganjam": ["Brahmapur (Berhampur)", "Aska", "Bhanjanagar", "Chatrapur", "Hinjilicut", "Polasara", "Purushottampur", "Rambha", "Surada", "Kabisuryanagar", "Khallikote", "Chikiti"],
  "Jagatsinghpur": ["Jagatsinghpur Town", "Balikuda", "Biridi", "Erasama", "Kujang", "Naugaon", "Raghunathpur", "Tirtol", "Paradeep"],
  "Jajpur": ["Jajpur Town", "Jajpur Road (Vyasanagar)", "Badachana", "Bari", "Binjharpur", "Danagadi", "Dasarathpur", "Dharmasala", "Korei", "Rasulpur", "Sukinda"],
  "Jharsuguda": ["Jharsuguda Town", "Belpahar", "Brajrajnagar", "Kirmira", "Kolabira", "Laikera", "Lakhanpur"],
  "Kalahandi": ["Bhawanipatna", "Dharamgarh", "Golamunda", "Jaipatna", "Junagarh", "Kalampur", "Karlamunda", "Koksara", "Lanjigarh", "Madanpur Rampur", "Narla", "Thuamul Rampur", "Kesinga"],
  "Kandhamal": ["Phulbani", "Balliguda", "Chakapad", "Daringbadi", "G.Udayagiri", "Khajuripada", "Kotagarh", "Nuagaon", "Phiringia", "Raikia", "Tikabali", "Tumudibandha"],
  "Kendrapara": ["Kendrapara Town", "Aul", "Derabish", "Garadapur", "Mahakalapada", "Marshaghai", "Pattamundai", "Rajanagar", "Rajkanika"],
  "Kendujhar": ["Keonjhar Town", "Anandapur", "Bansapal", "Champua", "Ghasipura", "Ghatgaon", "Harichandanpur", "Hatadihi", "Jhumpura", "Joda", "Patna", "Saharpada", "Telkoi", "Barbil"],
  "Khordha": ["Bhubaneswar", "Jatni", "Khordha Town", "Balipatna", "Balianta", "Banapur", "Begunia", "Bolagarh", "Chilika", "Tangi"],
  "Koraput": ["Koraput Town", "Jeypore", "Sunabeda", "Bandhugaon", "Boipariguda", "Borigumma", "Dasamantapur", "Kotpad", "Kundura", "Lamtaput", "Laxmipur", "Nandapur", "Narayanpatna", "Pottangi", "Semiliguda"],
  "Malkangiri": ["Malkangiri Town", "Chitrakonda", "Kalimela", "Khairput", "Korukonda", "Kudumulugumma", "Mathili", "Podia", "Balimela"],
  "Mayurbhanj": ["Baripada", "Rairangpur", "Karanjia", "Badasahi", "Bahalda", "Bangriposi", "Betnoti", "Bijatala", "Bisoi", "GB Nagar", "Jamda", "Jashipur", "Kaptipada", "Khunta", "Kusumi", "Morada", "Rasgovindpur", "Saraskana", "Shamakhunta", "Suliapada", "Thakurmunda", "Tiring", "Udala"],
  "Nabarangpur": ["Nabarangpur Town", "Chandahandi", "Dabugam", "Jharigam", "Kosagumuda", "Nandahandi", "Papadahandi", "Raighar", "Tentulikhunti", "Umerkote"],
  "Nayagarh": ["Nayagarh Town", "Bhapur", "Dasapalla", "Gania", "Khandapada", "Nuagaon", "Odagaon", "Ranapur"],
  "Nuapada": ["Nuapada Town", "Khariar", "Boden", "Komna", "Sinapali"],
  "Puri": ["Puri City", "Astaranga", "Brahmagiri", "Delanga", "Gop", "Kakatpur", "Kanas", "Krushnaprasad", "Nimapada", "Pipili", "Satyabadi"],
  "Rayagada": ["Rayagada Town", "Gunupur", "Bissam Cuttack", "Chandrapur", "Gudari", "Kalyansingpur", "Kashipur", "Kolnara", "Muniguda", "Padmapur", "Ramanaguda"],
  "Sambalpur": ["Sambalpur City", "Bamra", "Dhankauda", "Jamankira", "Jujomura", "Kuchinda", "Maneswar", "Naktideul", "Rairakhol", "Rengali", "Burla", "Hirakud"],
  "Subarnapur": ["Sonepur Town", "Binika", "Birmaharajpur", "Dunguripali", "Tarbha", "Ullunda"],
  "Sundargarh": ["Rourkela", "Sundargarh Town", "Bargaon", "Bisra", "Bonei", "Gurundia", "Hemgir", "Koida", "Kuarmunda", "Kutra", "Lathikata", "Lahunipara", "Lephripara", "Nuagaon", "Rajgangpur", "Subdega", "Tangarpali"]
};
