"use client";
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function InjectDataPage() {
  const [status, setStatus] = useState("Injecting data... Do not close window.");

  useEffect(() => {
    async function injectData() {
      try {
        const doctorsToInject = [
          {
            id: "dr-satyabrata-das",
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
            education: [{ degree: "MBBS, MS (General Surgery), MCh (Surgical Oncology)", institution: "Unknown" }],
            languages: ["English", "Hindi", "Odia"],
            clinicName: "Utkal Hospital",
            address: "Defence Colony, Neeladri Vihar, Bhubaneswar",
            phone: "0674-2974911",
            district: "Bhubaneswar",
            city: "Bhubaneswar",
            state: "Odisha",
            locations: [{ clinicName: "Utkal Hospital", address: "Defence Colony, Neeladri Vihar, Bhubaneswar", phone: "0674-2974911", hours: "Mon - Sat: 10:00 AM - 5:00 PM" }]
          },
          {
            id: "dr-sunil-kumar-sharma",
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
            education: [{ degree: "MBBS, MD (Medicine), DM (Cardiology)", institution: "Unknown" }],
            languages: ["English", "Hindi", "Odia"],
            clinicName: "Sanjivani Hospital",
            address: "Khetrajpur, Sambalpur, Odisha 768003",
            phone: "+91-9437050511",
            district: "Sambalpur",
            city: "Sambalpur",
            state: "Odisha",
            locations: [{ clinicName: "Sanjivani Hospital", address: "Khetrajpur, Sambalpur, Odisha 768003", phone: "+91-9437050511", hours: "Mon - Sat: 10:00 AM - 1:00 PM & 6:00 PM - 9:00 PM" }]
          },
          {
            id: "dr-bansidhar-mulia",
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
            education: [{ degree: "MBBS, MS, MCh (Plastic Surgery)", institution: "Unknown" }],
            languages: ["English", "Hindi", "Odia"],
            clinicName: "KIMS Hospital",
            address: "Patia, Bhubaneswar, Odisha 751024",
            phone: "+91-8895318181",
            district: "Bhubaneswar",
            city: "Bhubaneswar",
            state: "Odisha",
            locations: [{ clinicName: "KIMS Hospital", address: "Patia, Bhubaneswar, Odisha 751024", phone: "+91-8895318181", hours: "Mon - Sat: 9:00 AM - 5:00 PM" }]
          }
        ];

        // Write to Firestore sequentially
        for (const doctorData of doctorsToInject) {
          await setDoc(doc(db, "directory", doctorData.id), doctorData);
        }
        
        setStatus("SUCCESS! All 3 new doctors have been injected into the live database.");
      } catch (error: any) {
        console.error("Injection failed:", error);
        setStatus("Error: " + error.message);
      }
    }

    injectData();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
        <h1 className="text-2xl font-black text-slate-800 mb-4">Database Injection</h1>
        <div className={`p-4 rounded-xl font-bold ${
          status.includes("SUCCESS") ? "bg-emerald-50 text-emerald-600" :
          status.includes("Error") ? "bg-red-50 text-red-600" :
          "bg-blue-50 text-blue-600 animate-pulse"
        }`}>
          {status}
        </div>
      </div>
    </div>
  );
}
