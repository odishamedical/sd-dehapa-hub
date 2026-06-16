const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: "sd-auth-center.firebaseapp.com",
  projectId: "sd-auth-center",
  storageBucket: "sd-auth-center.firebasestorage.app",
  messagingSenderId: "393346058191",
  appId: "1:393346058191:web:a5e96e1c481a72f86db4ba"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newDoctors = [
  {
    type: "doctor",
    customSlug: "dr-satyabrata-das-surgical-oncologist",
    name: "Dr. Satyabrata Das",
    category: "Doctor",
    subCategory: "Surgical Oncologist",
    qualification: "MBBS, MS (General Surgery), MCh (Surgical Oncology)",
    experience: "18+ Yrs",
    rating: "4.8",
    image: "/images/drsatybrata.PNG",
    verified: false,
    about: "Dr. Satyabrata Das is a highly experienced Surgical Oncologist and General Surgeon based in Bhubaneswar, Odisha, with over 18 years of clinical experience. He is recognized for his expertise in complex laparoscopic and open cancer surgeries, particularly in head and neck, breast, gastrointestinal, and gynecological cancers.",
    specialties: ["Oncoplastic", "Thoracic", "Hepatobiliary"],
    languages: ["English", "Hindi", "Odia"],
    locations: [
      {
        clinicName: "Utkal Hospital",
        address: "Defence Colony, Neeladri Vihar, Bhubaneswar",
        phone: "0674-2974911",
        hours: "Mon - Sat: 10:00 AM - 5:00 PM"
      }
    ],
    clinicName: "Utkal Hospital",
    address: "Defence Colony, Neeladri Vihar, Bhubaneswar",
    phone: "0674-2974911",
    district: "Bhubaneswar",
    city: "Bhubaneswar",
    state: "Odisha"
  },
  {
    type: "doctor",
    customSlug: "dr-sunil-kumar-sharma-cardiologist",
    name: "Dr. Sunil Kumar Sharma",
    category: "Doctor",
    subCategory: "Cardiologist",
    qualification: "MBBS, MD (Medicine), DM (Cardiology)",
    experience: "25+ Yrs",
    rating: "4.9",
    image: "/images/drsunilsharma.PNG",
    verified: false,
    about: "Dr. Sunil Kumar Sharma is a highly experienced cardiologist and physician based in Sambalpur, Odisha, with over 25 years of extensive medical experience. He specializes in providing comprehensive cardiac care, focusing on preventive cardiology and the management of complex heart conditions.",
    specialties: ["Preventive Cardiology", "Echocardiography", "Heart Failure Management"],
    languages: ["English", "Hindi", "Odia"],
    locations: [
      {
        clinicName: "Sanjivani Hospital",
        address: "Khetrajpur, Sambalpur, Odisha 768003",
        phone: "+91-9437050511",
        hours: "Mon - Sat: 10:00 AM - 1:00 PM & 6:00 PM - 9:00 PM"
      }
    ],
    clinicName: "Sanjivani Hospital",
    address: "Khetrajpur, Sambalpur, Odisha 768003",
    phone: "+91-9437050511",
    district: "Sambalpur",
    city: "Sambalpur",
    state: "Odisha"
  },
  {
    type: "doctor",
    customSlug: "dr-bansidhar-mulia-plastic-surgeon",
    name: "Dr. Bansidhar Mulia",
    category: "Doctor",
    subCategory: "Plastic Surgeon",
    qualification: "MBBS, MS, MCh (Plastic Surgery)",
    experience: "24+ Yrs",
    rating: "4.8",
    image: "/images/Dr banshidhara.PNG",
    verified: false,
    about: "Dr. Bansidhar Mulia is a highly skilled Plastic, Reconstructive, and Aesthetic Surgeon with 24 years of extensive experience. Currently serving as a Senior Consultant and Head of the Department at KIMS Hospital, Bhubaneswar, he specializes in trauma care, cosmetic procedures, and reconstructive surgeries.",
    specialties: ["Cosmetic Surgery", "Reconstructive Surgery", "Trauma Care", "Burn Management"],
    languages: ["English", "Hindi", "Odia"],
    locations: [
      {
        clinicName: "KIMS Hospital",
        address: "Patia, Bhubaneswar, Odisha 751024",
        phone: "+91-8895318181",
        hours: "Mon - Sat: 9:00 AM - 5:00 PM"
      }
    ],
    clinicName: "KIMS Hospital",
    address: "Patia, Bhubaneswar, Odisha 751024",
    phone: "+91-8895318181",
    district: "Bhubaneswar",
    city: "Bhubaneswar",
    state: "Odisha"
  }
];

async function run() {
  for (const docData of newDoctors) {
    console.log("Adding doc:", docData.name);
    try {
      const docRef = await addDoc(collection(db, 'directory'), docData);
      console.log("Added with ID:", docRef.id);
    } catch (e) {
      console.error("Error adding doc:", e);
    }
  }
  process.exit(0);
}

run();
