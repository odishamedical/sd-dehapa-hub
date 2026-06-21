"use client";

import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function UserPresenceProvider() {
  useEffect(() => {
    let authUser: any = null;
    let interval: any = null;

    const updatePresence = async () => {
      if (authUser) {
        try {
          await updateDoc(doc(db, 'users', authUser.uid), {
            lastActiveAt: serverTimestamp()
          });
        } catch (error) {
          // Silent catch for permission errors if user doc doesn't exist yet
        }
      }
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      authUser = user;
      if (user) {
        updatePresence();
        // Update presence every 3 minutes while the app is open
        interval = setInterval(updatePresence, 3 * 60 * 1000);
      } else {
        if (interval) clearInterval(interval);
      }
    });

    // Also update on window focus to catch when they return to the tab
    const handleFocus = () => {
      if (authUser) updatePresence();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
    }

    return () => {
      unsubscribe();
      if (interval) clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, []);

  return null;
}
