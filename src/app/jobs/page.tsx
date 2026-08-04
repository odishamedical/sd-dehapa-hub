"use client";

import React, { useState, useEffect } from "react";
import { getDocs, query, collection, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Job, jobsCollection } from "@/lib/jobs";
import PostJobModal from "./components/PostJobModal";
import GlobalHeader from "@/components/GlobalHeader";
import Footer from "@/components/GlobalFooter";
import { MapPin, Briefcase, IndianRupee, Clock, Search, Filter, User } from "lucide-react";
import Image from "next/image";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState(""); // Employer type filter

  // Mock profile for public page (Normally fetched from context)
  const mockProfile = { id: "user_123", role: "vendor", companyName: "", email: "", phone: "" };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const q = query(jobsCollection, where("status", "==", "Active"));
      const snapshot = await getDocs(q);
      const activeJobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      // Sort by creation locally since composite indexes might not exist yet
      activeJobs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setJobs(activeJobs);
    } catch (e) {
      console.error("Error fetching jobs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.shopName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType ? job.industry === filterType : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
      <GlobalHeader />

      <main className="flex-1">
        {/* Premium Hero Section */}
        <div className="relative py-20 px-4 md:px-8 overflow-hidden bg-slate-950 border-b border-white/10">
          <Image 
            src="/stock/hero-jobs.png" 
            alt="Dehapa Medical Careers" 
            fill 
            className="object-cover absolute inset-0 z-0" 
            priority={true}
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50 z-0"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-[80px] z-0"></div>
          
          <div className="max-w-6xl mx-auto relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
              Dehapa <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Medical Careers</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Find your next role in healthcare. From specialized surgeons to pharmacy distribution, discover opportunities across the Dehapa ecosystem.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => setShowPostModal(true)} className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-8 py-4 rounded-2xl font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 text-lg w-full sm:w-auto justify-center">
                <Briefcase className="w-5 h-5" /> Post a Medical Job
              </button>
              <a href="/jobs/profile" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 text-lg w-full sm:w-auto justify-center">
                <User className="w-5 h-5" /> Create Seeker Profile
              </a>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 -mt-8 relative z-20">
          <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search job titles or hospitals..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white rounded-xl pl-12 pr-4 py-3 transition-all"
              />
            </div>
            <div className="w-full md:w-64 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white rounded-xl pl-12 pr-4 py-3 transition-all appearance-none"
              >
                <option value="">All Employer Types</option>
                <option value="Hospital">Hospitals</option>
                <option value="Pharmacy / Retail">Pharmacies</option>
                <option value="Diagnostic Lab">Labs</option>
                <option value="Dehapa Platform (Internal)">Dehapa Platform</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-[2rem] border border-white/5">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No jobs found</h3>
              <p className="text-slate-400">Try adjusting your search criteria or employer filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map(job => (
                <div key={job.id} className="bg-slate-900 border border-white/5 hover:border-teal-500/30 rounded-[2rem] p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10 group flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 overflow-hidden shrink-0 relative flex items-center justify-center">
                      {job.companyLogo ? (
                        <Image src={job.companyLogo} alt={job.shopName} fill className="object-cover" />
                      ) : (
                        <Building2 className="w-8 h-8 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                          {job.industry}
                        </span>
                        <span className="text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(job.createdAt?.seconds * 1000).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-1">{job.title}</h3>
                      <p className="text-slate-400 text-sm line-clamp-1">{job.shopName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-slate-300 mb-6 flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="line-clamp-1">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      <span>{job.jobType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-slate-500" />
                      <span className="line-clamp-1">{job.salaryRange || 'Not disclosed'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="line-clamp-1">By {job.deadline}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.skillsRequired?.slice(0, 3).map(skill => (
                      <span key={skill} className="text-[11px] font-bold bg-white/5 border border-white/10 text-slate-400 px-2 py-1 rounded-md">
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired?.length > 3 && (
                      <span className="text-[11px] font-bold bg-white/5 border border-white/10 text-slate-400 px-2 py-1 rounded-md">
                        +{job.skillsRequired.length - 3} more
                      </span>
                    )}
                  </div>

                  <a href="/jobs/profile" className="w-full text-center py-3 bg-white/5 hover:bg-teal-500 hover:text-slate-950 text-white font-bold rounded-xl transition-all border border-white/10 hover:border-transparent mt-auto text-sm block">
                    View Details & Apply
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      {showPostModal && (
        <PostJobModal 
          profile={mockProfile} 
          onClose={() => setShowPostModal(false)} 
          onSuccess={() => {
            setShowPostModal(false);
            fetchJobs(); // Refresh
            alert("Job posted successfully! If you are a provider, it will appear here once approved by Admin.");
          }} 
        />
      )}
    </div>
  );
}
