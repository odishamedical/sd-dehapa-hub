"use client";
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function InjectDataPage() {
  const [status, setStatus] = useState("Injecting data...");

  useEffect(() => {
    const doctorData = {
      id: "dr-deepak-parida",
      category: "Doctor",
      subCategory: "Neurosurgery",
      name: "Dr. Deepak Kumar Parida",
      experience: "8+ Years",
      qualification: "M.Ch. (Neurosurgery), M.S.",
      about: "Eight years experience in operative neurosurgery with a log of more than 3000 surgical procedures. Honest, hard working, punctual and sincere.",
      specialties: ["Neurotrauma", "Neurooncology", "Spine Surgery", "Cerebrovascular Surgery", "Skull Base Surgery", "Epilepsy Surgery", "Pediatric Neurosurgery", "Peripheral Nerve Surgery"],
      clinicName: "Care Hospital",
      address: "Flat No.:102, 1st Floor, Block-C, Lifestyle Green Apartment, KIITS Square, Patia, Bhubaneswar, Odisha, Pin-751024",
      phone: "09654340633, 9439828381",
      email: "deepak7077@gmail.com",
      city: "Bhubaneswar",
      district: "Khordha",
      state: "Odisha",
      image: "/images/drdeepak.jpg",
      verified: false,
      rating: 4.9,
      reviews: 124,
      customSlug: "dr-deepak-kumar-parida-neurosurgery",
      ownerEmail: "deepak7077@gmail.com",
      
      // Advanced Fields
      experiences: [
        { role: "Consultant, Neurosurgery", hospital: "Care Hospital, Bhubaneswar", duration: "Oct 2018 - Present" },
        { role: "Consultant, Neurosurgery", hospital: "Sunshine Hospital, Bhubaneswar", duration: "May 2018 - Present" },
        { role: "Consultant, Neurosurgery", hospital: "Ashwini Hospital, Cuttack", duration: "Mar 2017 - Apr 2018" },
        { role: "Consultant, Neurosurgery", hospital: "Max Superspeciality Hospital, New Delhi", duration: "Feb 2016 - Feb 2017" }
      ],
      qualificationsList: [
        { degree: "Neurointerventional Surgery", institution: "Max Superspeciality Hospital, New Delhi", year: "2016-2017" },
        { degree: "Post Doctoral Fellow, Cerebrovascular Surgery", institution: "Sree Chitra Tirunal Institute", year: "2015" },
        { degree: "M.Ch (Neurosurgery)", institution: "S.C.B Medical College & Hospitals, Cuttack", year: "2010-2013" },
        { degree: "M.S (Gen. Surgery)", institution: "V.S.S. Medical College & Hospitals, Burla", year: "2006-2009" },
        { degree: "MBBS", institution: "V.S.S. Medical College & Hospitals, Burla", year: "1999-2004" }
      ],
      locations: [
        { name: "Care Hospital", address: "Bhubaneswar", city: "Bhubaneswar", days: "Mon-Sat", timings: "Soon to update", fee: "Contact Admin" },
        { name: "Sunshine Hospital", address: "Bhubaneswar", city: "Bhubaneswar", days: "Mon-Sat", timings: "Soon to update", fee: "Contact Admin" }
      ],
      
      // Personal & Registration Fields
      dob: "22/04/1979",
      maritalStatus: "Married",
      registrationNumber: "OMC-15243 | DMC-68932",
      showPersonalDetails: true,
      
      // Missing info that shouldn't crash the array mapping
      research: [],
      awards: []
    };

    async function doInsert() {
      try {
        await setDoc(doc(db, 'directory', doctorData.id), doctorData);
        setStatus("SUCCESS! Dr. Deepak is injected.");
        window.location.href = "/doctors/" + doctorData.id;
      } catch (err: any) {
        setStatus("Error: " + err.message);
      }
    }
    doInsert();
  }, []);

  return <div className="p-20 text-center font-bold text-2xl">{status}</div>;
}
