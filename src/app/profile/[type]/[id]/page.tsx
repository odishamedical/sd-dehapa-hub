"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import UniversalProfileLayout from '@/components/UniversalProfileLayout';

// Mock DB Fetch
const getMockProfile = (type: string, id: string) => {
  if (type === 'doctor') {
    if (id === 'dr-deepak-kumar-parida') {
      return {
        name: "Dr. Deepak Kumar Parida",
        subtitle: "Senior Consultant Surgical Oncology",
        image: "/images/drdeepak.jpg",
        verified: false,
        stats: { patients: "1k+", experience: "5+ Yrs", rating: "4.9" },
        about: "Dr. Deepak Kumar Parida is a leading Surgical Oncologist based in Bhubaneswar, Odisha.",
        details: [
          { label: "Education", value: "MBBS, MS, MCh (Surgical Oncology)" },
          { label: "Registration", value: "Medical Council of India" },
          { label: "Languages", value: "English, Hindi, Odia" }
        ],
        roster: ["Apollo Hospital, Bhubaneswar", "Sparsh Hospital, Bhubaneswar"],
        rawImages: [
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop"
        ],
      };
    }
    if (id === 'dr-satyabrata-das') {
      return {
        name: "Dr. Satyabrata Das",
        subtitle: "Surgical Oncologist and General Surgeon",
        image: "/images/drsatybrata.PNG",
        verified: false,
        stats: { patients: "10k+", experience: "18+ Yrs", rating: "4.8" },
        about: "Dr. Satyabrata Das is a highly experienced Surgical Oncologist and General Surgeon based in Bhubaneswar, Odisha, with over 18 years of clinical experience. He is recognized for his expertise in complex laparoscopic and open cancer surgeries, particularly in head and neck, breast, gastrointestinal, and gynecological cancers.",
        details: [
          { label: "Education", value: "MBBS, MS (General Surgery), MCh (Surgical Oncology)" },
          { label: "Specialty", value: "Oncoplastic, Thoracic, Hepatobiliary" },
          { label: "Languages", value: "English, Hindi, Odia" }
        ],
        roster: ["Utkal Hospital, Bhubaneswar"],
        rawImages: [
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop"
        ],
      };
    }
    if (id === 'dr-sunil-sharma') {
      return {
        name: "Dr. Sunil Kumar Sharma",
        subtitle: "Professor & Senior Consultant Cardiologist",
        image: "/images/drsunilsharma.PNG",
        verified: false,
        stats: { patients: "50k+", experience: "25+ Yrs", rating: "4.9" },
        about: "Dr. Sunil Kumar Sharma is widely regarded as one of the most prominent, trusted, and experienced cardiology experts in Western Odisha. He holds advanced academic and super-specialty medical designations, practicing concurrently in both public healthcare and private consultation.",
        details: [
          { label: "Education", value: "MBBS, MD (General Medicine), DM (Cardiology)" },
          { label: "Specialty", value: "Invasive Cardiology" },
          { label: "Languages", value: "English, Hindi, Odia" }
        ],
        roster: ["VIMSAR, Burla", "Sambalpur Heart Clinic"],
        rawImages: [
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop"
        ],
      };
    }
    if (id === 'dr-bansidhar-mulia') {
      return {
        name: "Dr. Bansidhar Mulia",
        subtitle: "Plastic, Cosmetic, and Reconstructive Surgeon",
        image: "/images/Dr banshidhara.PNG",
        verified: false,
        stats: { patients: "15k+", experience: "24+ Yrs", rating: "4.8" },
        about: "Dr. Bansidhar Mulia is a highly experienced Plastic, Cosmetic, and Reconstructive Surgeon based in Bhubaneswar, Odisha. With over 24 years of overall medical experience, he is currently associated with the Kalinga Institute of Medical Sciences (KIMS) and Pradyumna Bal Memorial Hospital.",
        details: [
          { label: "Education", value: "MBBS, MS, MCh (Plastic Surgery)" },
          { label: "Specialty", value: "Aesthetic Surgery, Trauma & Microsurgery" },
          { label: "Languages", value: "English, Hindi, Odia" }
        ],
        roster: ["Pradyumna Bal Memorial Hospital", "KIMS, Bhubaneswar"],
        rawImages: [
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop"
        ],
      };
    }

    return {
      name: "Dr. A. K. Sharma",
      subtitle: "Senior Cardiologist",
      image: "",
      verified: true,
      stats: { patients: "5k+", experience: "15 Yrs", rating: "4.8" },
      about: "Dr. Sharma is a leading interventional cardiologist specializing in angioplasty and heart failure management.",
      details: [
        { label: "Education", value: "MBBS, MD, DM (Cardiology)" },
        { label: "Registration", value: "MCI-12345" },
        { label: "Languages", value: "English, Hindi, Odia" }
      ],
      roster: ["Apollo Super Specialty, Bhubaneswar", "LifeCare Clinic, Sambalpur"],
      rawImages: [
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop"
        ],
    };
  }
  
  if (type === 'hospital') {
    if (id === 'smile-dental') {
      return {
        name: "Smile Dental Clinic",
        subtitle: "Single-Specialty Clinic",
        image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&q=80",
        verified: false,
        stats: { rating: "4.7", reviews: "128" },
        about: "State-of-the-art dental care facility offering comprehensive oral health services.",
        details: [
          { label: "Phone", value: "+91 98765 43210" },
          { label: "Address", value: "Jaydev Vihar, Bhubaneswar" },
          { label: "Hours", value: "Mon-Sat: 10:00 AM - 8:00 PM" }
        ],
        roster: ["Dr. Amit Kumar (Orthodontist)"],
        rawImages: ["https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80"]
      };
    }
    if (id === 'nidaan-polyclinic') {
      return {
        name: "Nidaan Poly-Clinic & Diagnostics",
        subtitle: "Poly-Clinic",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80",
        verified: false,
        stats: { departments: "8", doctors: "15", rating: "4.5" },
        about: "A multi-specialty outpatient clinic equipped with advanced diagnostic labs and pharmacy.",
        details: [
          { label: "Phone", value: "+91 99887 76655" },
          { label: "Address", value: "Patia, Bhubaneswar" },
          { label: "Lab Available", value: "Yes" }
        ],
        roster: ["General Medicine", "Pediatrics", "Gynecology", "Orthopedics", "Pathology"],
        rawImages: ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80"]
      };
    }
    if (id === 'sparsh-standard') {
      return {
        name: "Sparsh Hospital",
        subtitle: "Nursing Home / Care Center",
        image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80",
        verified: false,
        stats: { beds: "50", icu: "10", emergency: "24/7" },
        about: "A trusted local nursing home providing primary and secondary care with 24/7 emergency support.",
        details: [
          { label: "Phone", value: "0674-2567890" },
          { label: "Address", value: "Saheed Nagar, Bhubaneswar" },
          { label: "Ambulance", value: "Available" }
        ],
        roster: ["General Surgery", "Internal Medicine", "Obstetrics"],
        rawImages: ["https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80"]
      };
    }
    if (id === 'amri-standard') {
      return {
        name: "AMRI Hospitals",
        subtitle: "Corporate Hospital",
        image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&q=80",
        verified: false,
        stats: { beds: "400+", icu: "80", rating: "4.8" },
        about: "One of the largest corporate healthcare networks in Eastern India, providing quaternary care.",
        details: [
          { label: "Phone", value: "0674-6666600" },
          { label: "Address", value: "Khandagiri, Bhubaneswar" },
          { label: "Insurance", value: "All Major TPAs" }
        ],
        roster: ["Cardiology", "Neurology", "Oncology", "Orthopedics", "Gastroenterology"],
        rawImages: ["https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80"]
      };
    }
    if (id === 'apollo-premium') {
      return {
        name: "Apollo Hospitals Bhubaneswar",
        subtitle: "Corporate Hospital",
        image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80",
        verified: false,
        isPremium: true, // Flag for Mini-Website layout
        stats: { beds: "350", icu: "65", rating: "4.9" },
        about: "A multi-specialty tertiary care hospital offering world-class medical facilities and renowned specialists.",
        details: [
          { label: "Phone", value: "0674-6661016" },
          { label: "Address", value: "Sainik School Road, Unit 15, Bhubaneswar" },
          { label: "Established", value: "2010" }
        ],
        roster: ["Cardiothoracic Surgery", "Neurosurgery", "Medical Oncology", "Joint Replacement"],
        rawImages: ["https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80"],
        healthPackages: [
          { name: "Apollo Master Health Check", price: "₹4,500", included: "Complete Blood Count, Lipid Profile, Liver Function, ECG, X-Ray Chest" },
          { name: "Apollo Heart Check", price: "₹3,200", included: "Cardiac Risk Marker, TMT, 2D Echo, Consultation" }
        ]
      };
    }

  }

  // Generic fallback
  return {
    name: "Medical Facility",
    subtitle: "Healthcare Provider",
    image: "",
    verified: false,
    stats: { rating: "4.5", status: "Active" },
    about: "A registered healthcare provider on the Dehapa Health Hub network.",
    details: [],
    roster: [],
    mapUrl: "https://maps.google.com/maps?q=Odisha&t=&z=15&ie=UTF8&iwloc=&output=embed",
    phone: "0674-1234567"
  };
};

export default function PublicProfile({ params }: { params: Promise<{ type: string, id: string }> }) {
  const unwrappedParams = React.use(params);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const docRef = doc(db, 'directory', unwrappedParams.id);
        const docSnap = await Promise.race([
          getDoc(docRef),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 3000))
        ]) as any;
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            ...data,
            name: data.name || data.basicInfo?.fullName || "Unnamed",
            subtitle: data.category || data.basicInfo?.specialityName || "Medical Professional",
            image: data.image || data.basicInfo?.profilePhoto || "",
            about: data.about || data.description || "No description provided.",
            stats: { rating: "4.5", status: "Active" },
            details: [],
            roster: [],
            verified: data.verified || false,
            galleryImages: data.galleryImages || [],
            rawImages: data.rawImages || [],
            mapUrl: data.mapUrl || data.clinicMapUrl || "https://maps.google.com/maps?q=Odisha&t=&z=15&ie=UTF8&iwloc=&output=embed",
            phone: data.phone || data.receptionPhone || "Not available"
          });
          return;
        }
      } catch(err) {
        console.log("Failed to fetch from DB, falling back to mock", err);
      }
      setProfile(getMockProfile(unwrappedParams.type, unwrappedParams.id));
    };
    fetchProfile();
  }, [unwrappedParams.type, unwrappedParams.id]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-tenant-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading Profile...</p>
      </div>
    );
  }

  // Use the exact same layout for ALL profiles (Hospitals, Doctors, Clinics, Labs)
  return <UniversalProfileLayout profile={profile} unwrappedParams={unwrappedParams} />;
}

