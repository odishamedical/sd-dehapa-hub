"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/portal';

  const [authMethod, setAuthMethod] = useState<'select' | 'email' | 'whatsapp'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Save user to Firestore after login
  const saveUserToFirestore = async (user: any, additionalData: any = {}) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    let userRole = 'user';
    let userName = user.displayName || 'New User';
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        phone: user.phoneNumber || additionalData.phone || '',
        displayName: userName,
        role: userRole,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        linkedProjects: ['dehapa']
      }, { merge: true });
    } else {
      userRole = userSnap.data()?.role || 'user';
      userName = userSnap.data()?.displayName || userName;
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
    
    const userEmail = user.email || user.phoneNumber || additionalData.phone;
    if (userEmail === 'odishamedical@gmail.com') {
      userRole = 'super_admin';
    }
    
    const finalAvatar = user.photoURL || null;
    
    localStorage.setItem("sd_current_user_email", userEmail);
    localStorage.setItem("sd_current_user_role", userRole);
    localStorage.setItem("sd_current_user_name", userName);
    if (finalAvatar) {
        localStorage.setItem("sd_current_user_avatar", finalAvatar);
    } else {
        localStorage.removeItem("sd_current_user_avatar");
    }
    localStorage.setItem("sd_current_user_profile_complete", userSnap.exists() ? "true" : "false");
    
    // Notify GlobalHeader that auth state has changed
    window.dispatchEvent(new Event("sd_auth_change"));
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await saveUserToFirestore(result.user);
      router.push(redirectUrl);
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
        await saveUserToFirestore(result.user);
        router.push(redirectUrl);
      } catch (loginErr: any) {
        // If user not found, create one
        if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await saveUserToFirestore(result.user);
            router.push(redirectUrl);
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
             await saveUserToFirestore(result.user, { phone });
             router.push(redirectUrl);
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-teal-500/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center transform transition-transform hover:scale-105 p-2">
            <img src="/logo.png" alt="DehaPa Logo" className="w-full h-full object-contain" />
          </div>
        </Link>
        <h2 className="text-center text-3xl font-serif font-bold text-slate-900 drop-shadow-sm">
          Welcome to DehaPa
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-medium">
          Sign in to access your healthcare portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-[24px] sm:px-10 border border-slate-200 relative overflow-hidden">
          {/* Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-slate-400"></div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}

          {authMethod === 'select' && (
            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl font-bold shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>

              <button 
                onClick={() => setAuthMethod('whatsapp')}
                className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-xl font-bold shadow-md shadow-green-900/20 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.128.552 4.199 1.6 6.02L.213 23.315l5.421-1.423A11.97 11.97 0 0012.031 24c6.645 0 12.03-5.385 12.03-12.03S18.676 0 12.031 0zm0 22.008a9.98 9.98 0 01-5.088-1.385l-.365-.216-3.778.992.999-3.682-.237-.377a9.972 9.972 0 01-1.522-5.309c0-5.503 4.478-9.981 9.982-9.981 5.505 0 9.982 4.478 9.982 9.981 0 5.504-4.477 9.981-9.982 9.981h-.001zm5.474-7.481c-.301-.15-1.782-.879-2.059-.979-.277-.101-.479-.15-.68.15s-.777.979-.953 1.18c-.175.201-.35.226-.651.076-2.148-1.077-3.633-2.608-4.148-3.486-.176-.299.172-.279.467-.866.075-.15.038-.276-.001-.351-.038-.075-.68-1.637-.932-2.242-.244-.588-.492-.508-.68-.517-.175-.008-.377-.01-.578-.01s-.527.075-.803.376c-.276.301-1.054 1.028-1.054 2.508s1.079 2.909 1.23 3.109c.15.201 2.115 3.226 5.12 4.526 2.053.888 2.859.953 3.935.794.88-.13 1.782-.728 2.034-1.433.251-.705.251-1.308.176-1.433-.075-.125-.276-.201-.577-.351z"/></svg>
                Continue with WhatsApp
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-400 font-medium">Or</span>
                </div>
              </div>

              <button 
                onClick={() => setAuthMethod('email')}
                className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl font-bold shadow-md transition-all focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
              >
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                Continue with Email
              </button>
            </div>
          )}

          {authMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Email address</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors" 
                  placeholder="name@example.com" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors" 
                  placeholder="••••••••" 
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full flex items-center justify-center bg-teal-700 hover:bg-teal-800 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-teal-900/20 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In / Register'}
                </button>
                <button 
                  type="button"
                  onClick={() => setAuthMethod('select')}
                  className="w-full mt-3 text-sm text-slate-500 hover:text-slate-800 font-bold"
                >
                  Back to options
                </button>
              </div>
            </form>
          )}

          {authMethod === 'whatsapp' && (
            <div className="space-y-5 animate-fade-in">
              {!otpSent ? (
                <form onSubmit={sendWhatsAppOtp}>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">WhatsApp Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 text-sm font-bold">
                        +91
                      </span>
                      <input 
                        type="tel" 
                        required 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-r-xl bg-slate-50 border border-slate-200 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors" 
                        placeholder="10-digit number" 
                      />
                    </div>
                  </div>
                  <div className="pt-5">
                    <button 
                      type="submit" 
                      disabled={loading || phone.length < 10}
                      className="w-full flex items-center justify-center bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-xl font-bold shadow-md shadow-green-900/20 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366] disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Get OTP on WhatsApp'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAuthMethod('select')}
                      className="w-full mt-3 text-sm text-slate-500 hover:text-slate-800 font-bold"
                    >
                      Back to options
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={verifyWhatsAppOtp}>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Enter WhatsApp OTP</label>
                    <p className="text-xs text-slate-500 mb-3">We sent a 6-digit code to +91 {phone}</p>
                    <input 
                      type="text" 
                      required 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] outline-none transition-colors" 
                      placeholder="------" 
                    />
                  </div>
                  <div className="pt-5 flex gap-3">
                     <button 
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="w-1/3 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-3 rounded-xl font-bold shadow-sm transition-colors"
                    >
                      Change
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading || otp.length < 6}
                      className="w-2/3 flex items-center justify-center bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-xl font-bold shadow-md shadow-green-900/20 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
