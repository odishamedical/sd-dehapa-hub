import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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
const auth = getAuth(app);

const ciplaData = {
  id: "cipla",
  category: "Pharmacy",
  subCategory: "Global Pharmaceutical Company",
  name: "Cipla Limited",
  experience: "Since 1935",
  about: "Cipla is a leading Indian multinational pharmaceutical company. Guided by its core purpose of \"Caring for Life,\" the company is dedicated to providing high-quality, affordable medicines to patients across the globe.",
  specialties: ["Respiratory", "Cardiovascular", "Oncology", "Anti-infectives", "HIV/AIDS"],
  clinicName: "Cipla HQ",
  address: "Peninsula Business Park, Lower Parel, Mumbai",
  phone: "+91 22 4191 6000",
  email: "contactus@cipla.com",
  city: "Mumbai",
  district: "Mumbai City",
  state: "Maharashtra",
  country: "India",
  image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=400&auto=format&fit=crop",
  verified: false,
  isPremium: true,
  rating: 4.8,
  reviews: 15400,
  customSlug: "cipla",
  isPublished: true,
  fee: "Contact Admin",
  
  // Advanced Fields
  locations: [
    { name: "Cipla HQ", address: "Lower Parel", city: "Mumbai", days: "Mon-Fri", timings: "09:00 AM - 06:00 PM", fee: "NA" }
  ]
};

async function insertDoc() {
  try {
    // Attempt email sign in to satisfy request.auth != null
    await signInWithEmailAndPassword(auth, "admin@dehapa.com", "admin123");
    
    const docRef = doc(db, 'directory', ciplaData.id);
    await setDoc(docRef, ciplaData);
    console.log("Successfully inserted Cipla into Firestore!");
    process.exit(0);
  } catch (err) {
    console.error("Error inserting doc:", err);
    process.exit(1);
  }
}

insertDoc();
