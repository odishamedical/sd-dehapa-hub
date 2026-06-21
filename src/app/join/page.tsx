'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';
import { Search, MapPin, Star, Building2, User, ChevronRight, ShieldCheck, Zap } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, or } from 'firebase/firestore';

export default function JoinPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    
    try {
      // Very basic substring search simulation for demo purposes
      // In production, you would use Algolia or Typesense for fuzzy search
      const q = query(
        collection(db, 'directory'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const allDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter client side for substring matching since Firestore doesn't support native fuzzy text search
      const filtered = allDocs.filter((doc: any) => 
        (doc.name && doc.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.specialty && doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.city && doc.city.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B14] flex flex-col selection:bg-amber-500/30">
      <GlobalHeader />

      {/* Hero Section */}
      <div className="relative pt-24 pb-16 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-cyan-900/20 via-teal-900/10 to-transparent pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-bottom-4">
            <ShieldCheck className="w-4 h-4" />
            For Healthcare Providers
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white font-serif tracking-tight leading-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
            Claim Your Profile. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              Reach 100,000+ Patients.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            Join the Sovereign Health Network. Find your pre-generated profile below and instantly connect with thousands of patients seeking care in your city.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-2 sm:p-3 rounded-2xl sm:rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-500 delay-300">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Enter your Name, Clinic, or Specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-slate-500 outline-none pl-12 pr-4 py-3 sm:py-4 rounded-full"
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-900 font-black tracking-wide px-8 py-3 sm:py-4 rounded-xl sm:rounded-full transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>FIND MY PROFILE <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 pb-24 relative z-10">
        {searched && !loading && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-6 font-serif">
              {results.length > 0 ? `Found ${results.length} matching profiles` : 'No profiles found'}
            </h3>

            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((profile) => (
                  <div key={profile.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 hover:border-teal-500/50 rounded-2xl p-6 transition-all group flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 flex-shrink-0">
                        {profile.type === 'Hospital' ? (
                          <Building2 className="w-7 h-7 text-indigo-400" />
                        ) : (
                          <User className="w-7 h-7 text-teal-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">{profile.name}</h4>
                          {profile.isPremium && (
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-2 font-medium">{profile.specialty || profile.type}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.city || 'Odisha'}</span>
                          {profile.rating && (
                            <span className="flex items-center gap-1 text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-500" /> {profile.rating}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => router.push(`/claim-profile?id=${profile.id}`)}
                      className="w-full md:w-auto bg-slate-800 hover:bg-teal-500 text-white font-bold px-6 py-3 rounded-xl transition-colors border border-slate-700 hover:border-teal-500 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 text-amber-400" />
                      CLAIM PROFILE
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-slate-900/30 border border-slate-800 rounded-3xl p-12">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-slate-500" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Can't find your profile?</h4>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">We might not have added your practice to our directory yet. You can create a brand new verified profile from scratch.</p>
                <button 
                  onClick={() => router.push('/join/register')}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3 rounded-xl transition-colors border border-slate-700"
                >
                  Create New Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <GlobalFooter />
    </div>
  );
}
