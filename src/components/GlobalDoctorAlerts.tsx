"use client";

import React, { useState, useEffect } from 'react';
import IncomingPingWidget from '@/components/IncomingPingWidget';

export default function GlobalDoctorAlerts() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDoctorId(localStorage.getItem("sd_current_user_uid"));
      setRole(localStorage.getItem("sd_current_user_role"));
      
      // Setup dynamic listener for localstorage changes (logout/login/role-swap)
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

  if (role !== "doctor" && role !== "super_admin" || !doctorId) return null;

  return <IncomingPingWidget doctorId={doctorId} doctorSpecialty="Consultant Doctor" />;
}
