import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutosave<T>(data: T, docId?: string | null | number, fieldPath?: string | number, delay?: number) {
  if (typeof docId === 'number' && typeof fieldPath === 'undefined') {
    delay = docId;
    docId = null;
    fieldPath = '';
  }
  const [status, setStatus] = useState<SaveStatus>('idle');
  const initialRender = useRef(true);

  useEffect(() => {
    // Skip the first render so it doesn't immediately say "saving" on page load
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    setStatus('saving');

    const handler = setTimeout(async () => {
      if (!docId) {
        setStatus('error');
        return;
      }

      try {
        const docRef = doc(db, 'directory', docId);
        // Create an object with dynamic key for fieldPath
        const updateData = { [fieldPath]: data };
        
        await setDoc(docRef, updateData, { merge: true });
        
        setStatus('saved');
        
        setTimeout(() => setStatus('idle'), 3000);
      } catch (err) {
        console.error("Autosave error:", err);
        setStatus('error');
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [data, delay, docId, fieldPath]);

  return status;
}
