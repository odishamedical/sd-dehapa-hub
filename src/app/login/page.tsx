"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ConnectionService } from '@/services/connection.service';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  let redirectUrl = searchParams.get('redirect') || '/portal';
  const claimDoctorId = searchParams.get('claim');
  if (claimDoctorId) {
    redirectUrl = `/claim-profile?id=${claimDoctorId}`;
  }
  const referralCode = searchParams.get('ref') || null;

  const [authMethod, setAuthMethod] = useState<'select' | 'email' | 'whatsapp'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem("sd_current_user_email");
      const isProfileComplete = localStorage.getItem("sd_current_user_profile_complete") === "true";
      const role = localStorage.getItem("sd_current_user_role") || "user";
      
      if (email) {
        // We know the getSmartRedirect function is defined below, but we can just duplicate its simple logic or use a static route
        let finalRedirect = redirectUrl;
        if (finalRedirect === '/portal') {
          if (role === 'doctor') finalRedirect = '/portal/doctor';
          else if (role === 'hospital') finalRedirect = '/portal/hospital';
          else if (role === 'pharmacy') finalRedirect = '/portal/pharmacy';
          else if (role === 'lab') finalRedirect = '/portal/lab';
          else if (role === 'super_admin') finalRedirect = '/portal/admin';
        }
        
        if (!isProfileComplete) {
          router.replace(`/portal/setup?redirect=${encodeURIComponent(finalRedirect)}`);
        } else {
          router.replace(finalRedirect);
        }
      }
    }
  }, [router, redirectUrl]);

  // Save user to Firestore after login
  const saveUserToFirestore = async (user: any, additionalData: any = {}) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    let userRole = 'user';
    let userName = user.displayName || 'New User';
    let isProfileComplete = false;
    
    if (!userSnap.exists()) {
      const newUserDoc: any = {
        uid: user.uid,
        email: user.email || '',
        phone: user.phoneNumber || additionalData.phone || '',
        displayName: userName,
        avatar: user.photoURL || null,
        role: userRole,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        linkedProjects: ['dehapa']
      };
      
      if (referralCode) {
        newUserDoc.referredBy = referralCode;
      }
      
      await setDoc(userRef, newUserDoc, { merge: true });
    } else {
      const data = userSnap.data();
      userRole = data?.role || 'user';
      userName = data?.displayName || userName;
      
      if (data?.phone && data?.address?.city) {
          isProfileComplete = true;
      } else if (data?.isProfileComplete) {
          isProfileComplete = true;
      }

      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
    
    const userEmail = user.email || user.phoneNumber || additionalData.phone;
    
    // Auto-Connect Invite Logic
    if (referralCode) {
      try {
        const dirRef = doc(db, 'directory', referralCode);
        const dirSnap = await getDoc(dirRef);
        
        if (dirSnap.exists()) {
          const inviterData = dirSnap.data();
          
          // Create a connection request from the new user to the inviter
          await ConnectionService.requestConnection({
            initiatorId: user.uid,
            initiatorRole: userRole,
            initiatorName: userName,
            receiverId: referralCode,
            receiverRole: inviterData.role || 'doctor', // assume doctor if undefined
            receiverName: inviterData.entityName || 'Network Provider'
          });
          
          console.log("Successfully created connection request to", inviterData.entityName);
        }
      } catch (err) {
        console.error("Invite connection failed", err);
      }
    }

    if (userEmail && userRole === 'user') {
      try {
        const dirQuery = query(collection(db, 'directory'), where('ownerEmail', '==', userEmail.toLowerCase().trim()));
        const dirDocs = await getDocs(dirQuery);
        if (!dirDocs.empty) {
          const listing = dirDocs.docs[0].data();
          const category = listing.category || '';
          if (category.toLowerCase() === 'doctor') userRole = 'doctor';
          else if (category.toLowerCase() === 'hospital') userRole = 'hospital';
          else if (category.toLowerCase() === 'pharmacy') userRole = 'pharmacy';
          else if (category.toLowerCase() === 'lab') userRole = 'lab';
          else if (category.toLowerCase() === 'ambulance') userRole = 'ambulance';
          else userRole = 'owner';
          
          // Update user doc with new role
          await updateDoc(userRef, { role: userRole });
        }
      } catch (err) {
        console.error("Failed to check directory ownership", err);
      }
    }

    if (userEmail === 'odishamedical@gmail.com' || userEmail === 'admin@shyamdash.com') {
      userRole = 'super_admin';
    }
    
    const finalAvatar = user.photoURL || null;
    
    localStorage.setItem("sd_current_user_uid", user.uid);
    localStorage.setItem("sd_current_user_email", userEmail);
    localStorage.setItem("sd_current_user_role", userRole);
    localStorage.setItem("sd_current_user_name", userName);
    if (finalAvatar) {
        localStorage.setItem("sd_current_user_avatar", finalAvatar);
    } else {
        localStorage.removeItem("sd_current_user_avatar");
    }
    localStorage.setItem("sd_current_user_profile_complete", isProfileComplete ? "true" : "false");
    
    // Notify GlobalHeader that auth state has changed
    window.dispatchEvent(new Event("sd_auth_change"));
    
    return { role: userRole, isProfileComplete };
  };

  const getSmartRedirect = (role: string, currentRedirect: string) => {
    if (currentRedirect !== '/portal') return currentRedirect;
    if (role === 'doctor') return '/portal/doctor';
    if (role === 'hospital') return '/portal/hospital';
    if (role === 'pharmacy') return '/portal/pharmacy';
    if (role === 'lab') return '/portal/lab';
    if (role === 'super_admin') return '/portal/admin';
    return '/portal';
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { role, isProfileComplete } = await saveUserToFirestore(result.user);
      
      if (!isProfileComplete) {
        router.push(`/portal/setup?redirect=${encodeURIComponent(getSmartRedirect(role, redirectUrl))}`);
      } else {
        router.push(getSmartRedirect(role, redirectUrl));
      }
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Attempt login first
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const { role, isProfileComplete } = await saveUserToFirestore(result.user);
        
        if (!isProfileComplete) {
          router.push(`/portal/setup?redirect=${encodeURIComponent(getSmartRedirect(role, redirectUrl))}`);
        } else {
          router.push(getSmartRedirect(role, redirectUrl));
        }
      } catch (loginErr: any) {
        // If user not found, create one
        if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const { role, isProfileComplete } = await saveUserToFirestore(result.user);
            
            if (!isProfileComplete) {
              router.push(`/portal/setup?redirect=${encodeURIComponent(getSmartRedirect(role, redirectUrl))}`);
            } else {
              router.push(getSmartRedirect(role, redirectUrl));
            }
        } else {
            throw loginErr;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Mock OTP sending for now until backend is configured
      const res = await fetch('/api/whatsapp/auth/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Error sending WhatsApp message');
    } finally {
      setLoading(false);
    }
  };

  const verifyWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/whatsapp/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      // The backend needs to return a Firebase Custom Token or we use a workaround
      if (data.token) {
          import('firebase/auth').then(async ({ signInWithCustomToken }) => {
             const result = await signInWithCustomToken(auth, data.token);
             const role = await saveUserToFirestore(result.user, { phone });
             router.push(getSmartRedirect(role, redirectUrl));
          });
      } else {
          // Mock login for now if backend is not fully ready
          localStorage.setItem("sd_current_user_email", phone);
          localStorage.setItem("sd_current_user_profile_complete", "false");
          router.push(redirectUrl);
      }

    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-cyan-500/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center justify-center transform transition-transform hover:scale-105 p-2">
            <img src="/logo.png" alt="DehaPa Logo" className="w-full h-full object-contain" />
          </div>
        </Link>
        {referralCode && (
          <div className="flex justify-center mb-4 animate-in fade-in slide-in-from-top-4">
            <span className="bg-cyan-500/10 text-cyan-600 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest shadow-sm border border-cyan-500/20">
              You've been invited!
            </span>
          </div>
        )}
        <h2 className="text-center text-3xl font-serif font-black text-[#0a2540] tracking-tight drop-shadow-sm">
          Welcome to DehaPa
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          {referralCode ? 'Sign in to accept the invite and connect.' : 'Sign in to access your healthcare portal'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/70 backdrop-blur-xl py-8 px-4 shadow-[0_15px_40px_-10px_rgba(0,20,60,0.1)] sm:rounded-[24px] sm:px-10 border border-white relative overflow-hidden">
          {/* Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600"></div>

          {error && (
            <div className="mb-6 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-400 font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-4 rounded-xl font-bold shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-white disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
            </div>


        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent flex items-center justify-center text-slate-500 font-bold tracking-widest uppercase text-sm">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
