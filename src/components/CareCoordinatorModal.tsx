import React, { useState } from 'react';

export default function CareCoordinatorModal({ isOpen, onClose, providerType }: { isOpen: boolean, onClose: () => void, providerType: string }) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to Firebase admin_support_tickets in a real environment
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setQuery('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 border border-slate-200">
        {!submitted ? (
          <>
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 border-b border-slate-100">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <span className="text-2xl">👩‍⚕️</span>
              </div>
              <h2 className="text-xl font-serif font-bold text-slate-900">Need help finding the right {providerType}?</h2>
              <p className="text-sm text-slate-600 mt-2 font-medium">
                We noticed you're exploring multiple options. Our Care Coordinators are here to assist you personally!
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">What are you looking for?</label>
              <textarea 
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`e.g., I am looking for a ${providerType} who specializes in...`}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors min-h-[100px] resize-none mb-6"
              />
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold hover:from-teal-700 hover:to-cyan-700 shadow-md shadow-teal-900/20 transition-all"
                >
                  Send to Coordinator
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-8 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h2>
            <p className="text-slate-600 text-sm">
              Our Care Coordinator will contact you on your registered WhatsApp shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
