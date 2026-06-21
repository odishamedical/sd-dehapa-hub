'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, User, ShieldCheck, ArrowRight, Activity, FlaskConical, Stethoscope, Truck } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, limit, where } from 'firebase/firestore';

export default function JoinPage() {
  const router = useRouter();
  
  // State 1: Category Selection
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // State 2: Name Entry & Search
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const categories = [
    { id: 'Doctor', icon: Stethoscope, label: 'Doctor / Specialist' },
    { id: 'Hospital', icon: Building2, label: 'Hospital / Clinic' },
    { id: 'Diagnostic Lab', icon: FlaskConical, label: 'Diagnostic Lab' },
    { id: 'Pharmacy', icon: Activity, label: 'Pharmacy' },
    { id: 'Ambulance', icon: Truck, label: 'Ambulance Service' }
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim() || !selectedCategory) return;

    setLoading(true);
    setSearched(true);
    
    try {
      const q = query(
        collection(db, 'directory'),
        where('type', '==', selectedCategory),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const allDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter client side for substring matching
      const filtered = allDocs.filter((doc: any) => 
        (doc.name && doc.name.toLowerCase().includes(searchName.toLowerCase()))
      );

      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSelectedCategory(null);
    setSearchName('');
    setSearched(false);
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      <div className="flex-1 flex flex-col items-center pt-24 pb-16 px-6">
        
        {/* Header Text */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-800 text-sm font-bold tracking-widest uppercase mb-6">
            <ShieldCheck className="w-4 h-4" />
            Healthcare Providers
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Join the Sovereign Health Network
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Follow the steps below to claim your pre-generated profile or create a brand new one to connect with thousands of patients in your city.
          </p>
        </div>

        <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          
          {/* Progress Bar */}
          <div className="flex border-b border-slate-100">
            <div className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${!selectedCategory ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500' : 'bg-white text-slate-400'}`}>
              1. Select Category
            </div>
            <div className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${selectedCategory && !searched ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500' : 'bg-white text-slate-400'}`}>
              2. Find Your Profile
            </div>
            <div className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${searched ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500' : 'bg-white text-slate-400'}`}>
              3. Claim or Create
            </div>
          </div>

          <div className="p-8 md:p-12">
            
            {/* STEP 1: SELECT CATEGORY */}
            {!selectedCategory && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">How do you want to join?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-slate-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50 transition-all group"
                      >
                        <div className="w-16 h-16 bg-slate-100 group-hover:bg-teal-100 text-slate-500 group-hover:text-teal-600 rounded-full flex items-center justify-center transition-colors">
                          <Icon className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-teal-800">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: ENTER NAME */}
            {selectedCategory && !searched && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-xl mx-auto">
                <button onClick={resetSearch} className="text-slate-500 hover:text-slate-800 font-bold text-sm mb-8 flex items-center gap-2">
                  &larr; Back to Categories
                </button>
                
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">What is your name?</h2>
                  <p className="text-slate-500">Enter your name or facility name so we can check if you are already in our directory.</p>
                </div>

                <form onSubmit={handleSearch} className="space-y-6">
                  <div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        required
                        placeholder={selectedCategory === 'Doctor' ? "e.g. Dr. Shyam Dash" : "e.g. City Care Hospital"}
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium placeholder-slate-400 outline-none pl-14 pr-6 py-5 rounded-2xl focus:border-teal-500 focus:bg-white transition-colors text-lg"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading || !searchName.trim()}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-lg px-8 py-5 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>Search Directory <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3: RESULTS (CLAIM OR CREATE) */}
            {searched && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Search Results</h2>
                    <p className="text-slate-500">Showing results for "{searchName}" in {selectedCategory}</p>
                  </div>
                  <button onClick={() => setSearched(false)} className="text-teal-600 hover:text-teal-800 font-bold text-sm bg-teal-50 px-4 py-2 rounded-lg">
                    Search Again
                  </button>
                </div>

                {results.length > 0 ? (
                  <div className="space-y-4 mb-8">
                    <p className="font-bold text-slate-700 mb-4">We found these matching profiles. Is this you?</p>
                    {results.map((profile) => (
                      <div key={profile.id} className="bg-white border border-slate-200 hover:border-teal-500 rounded-2xl p-6 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm hover:shadow-md">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center border border-teal-100 flex-shrink-0">
                            {profile.type === 'Hospital' ? (
                              <Building2 className="w-7 h-7 text-teal-600" />
                            ) : (
                              <User className="w-7 h-7 text-teal-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">{profile.name}</h4>
                            <p className="text-slate-500 text-sm font-medium">{profile.specialty || profile.type} • {profile.city || 'Odisha'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => router.push(`/claim-profile?id=${profile.id}`)}
                          className="w-full md:w-auto bg-white hover:bg-slate-50 text-teal-700 font-bold px-6 py-3 rounded-xl transition-colors border border-teal-200"
                        >
                          Claim This Profile
                        </button>
                      </div>
                    ))}
                    
                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                      <p className="text-slate-500 mb-4">None of these are you?</p>
                      <button 
                        onClick={() => router.push('/join/register')}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg"
                      >
                        Create New Profile
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">No profiles found</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                      We do not have a pre-existing profile for "{searchName}" in our directory yet. Let's create your brand new verified profile!
                    </p>
                    <button 
                      onClick={() => router.push('/join/register')}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-colors shadow-lg shadow-teal-900/20"
                    >
                      Create New Profile
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
