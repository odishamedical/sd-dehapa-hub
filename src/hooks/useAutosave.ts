import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutosave<T>(data: T, docId?: string | null | number, fieldPath?: string | number, delay?: number, collectionName: string = 'directory') {
  if (typeof docId === 'number') {
    delay = docId;
    docId = null;
    fieldPath = '';
  }
  const [status, setStatus] = useState<SaveStatus>('idle');
  const initialRender = useRef(true);

  useEffect(() => {
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
        const docRef = doc(db, collectionName, docId as string);
        const updateData = fieldPath ? { [fieldPath]: data } : data;
        
        await setDoc(docRef, updateData as any, { merge: true });
        
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 3000);
      } catch (err) {
        console.error("Autosave error:", err);
        setStatus('error');
      }
    }, delay || 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [data, delay, docId, fieldPath]);

  return status;
}
