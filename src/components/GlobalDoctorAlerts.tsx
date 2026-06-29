"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import IncomingPingWidget from '@/components/IncomingPingWidget';

export default function GlobalDoctorAlerts() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDoctorId(localStorage.getItem("sd_current_user_uid"));
      setRole(localStorage.getItem("sd_current_user_role"));
      
      const handleStorageChange = () => {
        setDoctorId(localStorage.getItem("sd_current_user_uid"));
        setRole(localStorage.getItem("sd_current_user_role"));
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

  // Fetch the doctor's directory profile to get their real primarySpecialty
  useEffect(() => {
    if (!doctorId || (role !== "doctor" && role !== "super_admin")) {
      setSpecialty(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const q = query(
          collection(db, "directory"),
          where("ownerUid", "==", doctorId),
          where("type", "==", "doctor")
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          setSpecialty(docData.primarySpecialty || "general");
        } else {
          // Fallback if directory document hasn't been created yet
          setSpecialty("general");
        }
      } catch (err) {
        console.error("Failed to fetch doctor profile in GlobalDoctorAlerts:", err);
        setSpecialty("general");
      }
    };

    fetchProfile();
  }, [doctorId, role]);

  if ((role !== "doctor" && role !== "super_admin") || !doctorId || !specialty) {
    return null;
  }

  return <IncomingPingWidget doctorId={doctorId} doctorSpecialty={specialty} />;
}
