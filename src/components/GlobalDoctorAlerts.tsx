"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import IncomingPingWidget from '@/components/IncomingPingWidget';

export default function GlobalDoctorAlerts() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [realDoctorId, setRealDoctorId] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserEmail(localStorage.getItem("sd_current_user_email"));
      setRole(localStorage.getItem("sd_current_user_role"));
      setRealDoctorId(localStorage.getItem("sd_current_doctor_id"));
      setSpecialty(localStorage.getItem("sd_current_doctor_specialty"));
      
      const handleStorageChange = () => {
        setUserEmail(localStorage.getItem("sd_current_user_email"));
        setRole(localStorage.getItem("sd_current_user_role"));
        setRealDoctorId(localStorage.getItem("sd_current_doctor_id"));
        setSpecialty(localStorage.getItem("sd_current_doctor_specialty"));
      };
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("sd_role_upgraded", handleStorageChange);
      window.addEventListener("sd_auth_change", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("sd_role_upgraded", handleStorageChange);
        window.removeEventListener("sd_auth_change", handleStorageChange);
      };
    }
  }, []);

  // Fetch the doctor's directory profile if not already cached in localStorage
  useEffect(() => {
    if (!userEmail || (role !== "doctor" && role !== "super_admin")) {
      setRealDoctorId(null);
      setSpecialty(null);
      return;
    }

    // Skip DB fetch if already loaded from localStorage cache
    if (realDoctorId && specialty) {
      return;
    }

    const fetchProfile = async () => {
      try {
        // Query by ownerEmail (matches DoctorV2OwnerDashboard query)
        const q = query(
          collection(db, "directory"),
          where("ownerEmail", "==", userEmail),
          where("type", "==", "doctor")
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docId = snap.docs[0].id;
          const docData = snap.docs[0].data();
          setRealDoctorId(docId);
          setSpecialty(docData.primarySpecialty || "general");
          localStorage.setItem("sd_current_doctor_id", docId);
          localStorage.setItem("sd_current_doctor_specialty", docData.primarySpecialty || "general");
        }
      } catch (err) {
        console.error("Failed to fetch doctor profile in GlobalDoctorAlerts:", err);
      }
    };

    fetchProfile();
  }, [userEmail, role, realDoctorId, specialty]);

  if ((role !== "doctor" && role !== "super_admin") || !realDoctorId || !specialty) {
    return null;
  }

  return <IncomingPingWidget doctorId={realDoctorId} doctorSpecialty={specialty} />;
}
