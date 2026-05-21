"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import EcosystemSwitcher from '@/components/EcosystemSwitcher';

const DOCTORS = [
  { id: "dr-01", name: "Dr. Sandeep Mohanty", specialty: "Cardiologist", experience: "15 Years", rating: 4.9, hospital: "Apollo Hospitals, Bhubaneswar", fee: 800, available: true, img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop" },
  { id: "dr-02", name: "Dr. Ananya Das", specialty: "Pediatrician", experience: "8 Years", rating: 4.8, hospital: "KIMS, Bhubaneswar", fee: 600, available: true, img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop" },
  { id: "dr-03", name: "Dr. Rajesh Pattnaik", specialty: "Neurologist", experience: "22 Years", rating: 5.0, hospital: "SUM Ultimate, Bhubaneswar", fee: 1200, available: false, img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop" },
  { id: "dr-04", name: "Dr. Meera Nanda", specialty: "Dermatologist", experience: "12 Years", rating: 4.7, hospital: "Care Hospitals, Cuttack", fee: 500, available: true, img: "https://images.unsplash.com/photo-1594824436951-7f12620ce6f1?q=80&w=200&auto=format&fit=crop" },
  { id: "dr-05", name: "Dr. Prateek Mishra", specialty: "Orthopedic Surgeon", experience: "18 Years", rating: 4.9, hospital: "AMRI Hospitals, Bhubaneswar", fee: 1000, available: true, img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop" }
];

export default function DoctorsDirectory() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");

  const filteredDoctors = DOCTORS.filter(doc => {
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || doc.hospital.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = specialty === "All" || doc.specialty === specialty;
    return matchSearch && matchSpecialty;
  });

  return (
    <div className="min-h-screen bg-[#020610] text-[#f8fafc] font-sans selection:bg-[#06b6d4]/30">
      {/* Global Header */}
      <header className="relative z-50 h-[80px] border-b border-[#06b6d4]/20 bg-[#020610]/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-12 sticky top-0">
        <Link href="/" className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0d9488] flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-widest text-white uppercase font-serif">DehaPa <span className="text-[#06b6d4]">Health</span></span>
            <span className="text-[9px] text-[#0d9488] tracking-[0.2em] uppercase font-mono">Directory</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <EcosystemSwitcher />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-serif font-bold text-white mb-2">Find a <span className="text-[#06b6d4]">Specialist</span></h1>
          <p className="text-[#94a3b8]">Book a secure FHIR-compliant video consultation with top medical experts across Odisha.</p>
        </div>

        {/* Filters */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 md:p-6 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
          <div className="flex-1 w-full relative">
            <svg className="w-5 h-5 text-[#64748b] absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search by doctor name or hospital..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1e293b]/50 border border-[#334155] rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#06b6d4] transition-colors"
            />
          </div>
          <div className="w-full md:w-64">
            <select 
              value={specialty} 
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full bg-[#1e293b]/50 border border-[#334155] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#06b6d4] transition-colors appearance-none cursor-pointer"
            >
              <option value="All">All Specialties</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doc => (
            <div key={doc.id} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col justify-between hover:border-[#06b6d4]/50 transition-colors shadow-lg group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <img src={doc.img} alt={doc.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#1e293b] group-hover:border-[#06b6d4] transition-colors" />
                  <div className="flex items-center gap-1 bg-[#1e293b] px-2 py-1 rounded text-xs font-bold text-yellow-400">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    {doc.rating}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{doc.name}</h3>
                <p className="text-[#06b6d4] text-xs uppercase tracking-widest font-mono mb-3">{doc.specialty}</p>
                <div className="space-y-1 mb-6">
                  <p className="text-sm text-[#94a3b8] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    {doc.hospital}
                  </p>
                  <p className="text-sm text-[#94a3b8] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {doc.experience} Experience
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[#1e293b]">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#64748b] uppercase tracking-widest font-mono">Consultation Fee</span>
                  <span className="text-white font-bold text-lg">₹{doc.fee}</span>
                </div>
                {doc.available ? (
                  <Link href={`/portal/book?doctor=${doc.id}`} className="bg-[#06b6d4]/10 hover:bg-[#06b6d4] text-[#06b6d4] hover:text-[#020610] border border-[#06b6d4]/30 border-transparent hover:border-[#06b6d4] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                    Book Now
                  </Link>
                ) : (
                  <button disabled className="bg-[#1e293b] text-[#64748b] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-not-allowed">
                    Waitlist
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
