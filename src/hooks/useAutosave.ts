import { useState, useEffect, useRef } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutosave<T>(data: T, delay: number = 1000) {
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
      try {
        // Here we would normally make a fetch/Firebase call
        // await db.collection('doctors').doc(userId).set(data, { merge: true });
        
        // Mock network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setStatus('saved');
        
        // Reset to idle after a few seconds of showing the success checkmark
        setTimeout(() => setStatus('idle'), 3000);
      } catch (err) {
        setStatus('error');
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [data, delay]); // re-run whenever `data` changes

  return status;
}
