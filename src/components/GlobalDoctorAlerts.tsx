"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import IncomingPingWidget from '@/components/IncomingPingWidget';

export default function GlobalDoctorAlerts() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [realDoctorId, setRealDoctorId] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserUid(localStorage.getItem("sd_current_user_uid"));
      setRole(localStorage.getItem("sd_current_user_role"));
      
      const handleStorageChange = () => {
        setUserUid(localStorage.getItem("sd_current_user_uid"));
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

  // Fetch the doctor's directory profile to get their real directory ID and specialty
  useEffect(() => {
    if (!userUid || (role !== "doctor" && role !== "super_admin")) {
      setRealDoctorId(null);
      setSpecialty(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const q = query(
          collection(db, "directory"),
          where("ownerUid", "==", userUid),
          where("type", "==", "doctor")
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docId = snap.docs[0].id; // This is the directory document ID (e.g. 68bKd57p...)
          const docData = snap.docs[0].data();
          setRealDoctorId(docId);
          setSpecialty(docData.primarySpecialty || "general");
        } else {
          // Fallback if directory document hasn't been created yet
          setRealDoctorId(userUid);
          setSpecialty("general");
        }
      } catch (err) {
        console.error("Failed to fetch doctor profile in GlobalDoctorAlerts:", err);
        setRealDoctorId(userUid);
        setSpecialty("general");
      }
    };

    fetchProfile();
  }, [userUid, role]);

  if ((role !== "doctor" && role !== "super_admin") || !realDoctorId || !specialty) {
    return null;
  }

  return <IncomingPingWidget doctorId={realDoctorId} doctorSpecialty={specialty} />;
}
