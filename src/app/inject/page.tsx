"use client";
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function InjectDataPage() {
  const [status, setStatus] = useState("Injecting data... Do not close window.");

  useEffect(() => {
    async function injectData() {
      try {
        const doctorData = {
          id: "dr-jayanta-panda",
          category: "Doctor",
          subCategory: "General Medicine",
          name: "Dr. Jayanta Kumar Panda",
          experience: "27 Years Experience",
          degree: "MBBS, MD (General Medicine)",
          registration: "11524 (OCMR)",
          email: "drjayantpanda@gmail.com",
          about: "Professor of General Medicine. Dedicated to comprehensive patient care and advancing medical education.",
          clinicName: "Dr. Jayanta Clinic",
          address: "Ashrusudh, Bijupatnaik Square, Tulsipur, Cuttack-753008",
          city: "Cuttack",
          district: "Cuttack",
          state: "Odisha",
          country: "India",
          verified: false,
          customSlug: "dr-jayanta-kumar-panda-general-medicine",
          
          research: [
            {
              title: "Consensus recommendations on exploring effective solutions for the rising cost of diabetes",
              year: "2017",
              journal: "Diabetes Metab Syndr",
              link: "https://pubmed.ncbi.nlm.nih.gov/28325543/"
            },
            {
              title: "Trial design and baseline data for LIRA-PRIME: A randomized trial investigating the efficacy of liraglutide in controlling glycaemia in type 2 diabetes",
              year: "2019",
              journal: "Diabetes Obes Metab",
              link: "https://pubmed.ncbi.nlm.nih.gov/30828917/"
            },
            {
              title: "Consensus on Initiation and Intensification of Premix Insulin in Type 2 Diabetes Management",
              year: "2017",
              journal: "J Assoc Physicians India",
              link: "https://pubmed.ncbi.nlm.nih.gov/28527166/"
            }
          ],
          
          awards: [
            {
              title: "Fellow of Indian and American Colleges of Physicians, IMAAMS, RSSDI and Diabetes India",
              year: "Various"
            },
            {
              title: "Young Achievers Award - NCCD",
              year: "2018",
              organization: "Kolkata"
            },
            {
              title: "Awarded DMDSC honour",
              year: "2014",
              organization: "Dr. Mohan's Diabetes Specialty Centre, Chennai"
            },
            {
              title: "Editor, Orissa Physician Journal",
              year: "2017-2019"
            },
            {
              title: "Editor, Orissa Medical Journal",
              year: "2010-2016"
            }
          ]
        };

        // Write to Firestore
        await setDoc(doc(db, "directory", doctorData.id), doctorData);
        
        setStatus("SUCCESS! Dr. Jayanta is injected.");
        
        // Redirect to new premium profile
        window.location.href = `/doctors/${doctorData.customSlug}`;

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
