"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, UserCheck, Link as LinkIcon, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

interface FollowConnectButtonProps {
  profileId: string;
  profileRole: string;
  profileName: string;
}

export default function FollowConnectButton({ profileId, profileRole, profileName }: FollowConnectButtonProps) {
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"none" | "pending" | "approved">("none");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const uid = localStorage.getItem("sd_current_user_uid");
      const role = localStorage.getItem("sd_current_user_role") || "patient";
      const name = localStorage.getItem("sd_current_user_name");

      if (!uid) {
        setLoading(false);
        return;
      }

      setCurrentUser({ uid, role, name });

      try {
        // Check if connection exists where current user is initiator
        const q1 = query(
          collection(db, "connections"),
          where("initiatorId", "==", uid),
          where("receiverId", "==", profileId)
        );
        const snap1 = await getDocs(q1);

        // Check if connection exists where current user is receiver
        const q2 = query(
          collection(db, "connections"),
          where("receiverId", "==", uid),
          where("initiatorId", "==", profileId)
        );
        const snap2 = await getDocs(q2);

        if (!snap1.empty) {
          setConnectionStatus(snap1.docs[0].data().status as any);
        } else if (!snap2.empty) {
          setConnectionStatus(snap2.docs[0].data().status as any);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    checkStatus();
  }, [profileId]);

  const handleConnect = async () => {
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    try {
      // If patient is following a provider, it auto-approves. Otherwise, it's pending.
      const status = currentUser.role === "patient" ? "approved" : "pending";

      await addDoc(collection(db, "connections"), {
        initiatorId: currentUser.uid,
        initiatorName: currentUser.name || "User",
        initiatorRole: currentUser.role,
        receiverId: profileId,
        receiverName: profileName,
        receiverRole: profileRole,
        status: status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setConnectionStatus(status as any);
    } catch (e) {
      console.error(e);
      alert("Failed to connect. Please try again.");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <button disabled className="bg-slate-100 text-slate-400 font-bold px-6 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 min-w-[140px]">
        <Loader2 className="w-5 h-5 animate-spin" />
      </button>
    );
  }

  const isB2B = currentUser && currentUser.role !== "patient";

  if (connectionStatus === "approved") {
    return (
      <button disabled className="bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold px-6 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 min-w-[140px]">
        <UserCheck className="w-5 h-5" />
        {isB2B ? "Connected" : "Following"}
      </button>
    );
  }

  if (connectionStatus === "pending") {
    return (
      <button disabled className="bg-amber-50 border border-amber-200 text-amber-600 font-bold px-6 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 min-w-[140px]">
        <Loader2 className="w-5 h-5 animate-spin" />
        Request Pending
      </button>
    );
  }

  return (
    <button 
      onClick={handleConnect}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 min-w-[140px]"
    >
      {isB2B ? (
        <>
          <LinkIcon className="w-5 h-5" />
          Request Partnership
        </>
      ) : (
        <>
          <UserPlus className="w-5 h-5" />
          Follow
        </>
      )}
    </button>
  );
}
