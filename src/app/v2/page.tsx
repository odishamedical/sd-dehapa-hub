"use client";

import React from "react";
import { Search } from "lucide-react";

export default function V2Homepage() {
  return (
    <div className="flex flex-col w-full bg-white font-sans">
      
      {/* V2 Hero Section (Premium Light Theme, Contained Grid) */}
      <section className="relative pt-12 pb-16 z-20 flex justify-center w-full px-4 sm:px-8 lg:px-16">
        
        {/* Contained Hero Box (1400px Max Width) */}
        <div className="w-full max-w-[1400px] min-h-[500px] lg:min-h-[600px] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-gradient-to-br from-[#f8faff] to-blue-50 border border-slate-100/50 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 relative">
          
          {/* Placeholder for Custom Mobile Art / Desktop Art */}
          <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-end px-12 opacity-50 pointer-events-none">
             {/* Art will go here */}
             <div className="w-1/2 h-full border-2 border-dashed border-blue-200 rounded-3xl flex items-center justify-center text-blue-400 font-bold">
               Hero Image Space (Option B Mobile Art)
             </div>
          </div>

          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-black text-slate-900 tracking-tight mb-4 leading-[1.1]">
              Connecting You to <br className="hidden md:block" />
              <span className="text-[#0461be]">Better Health</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-700 mb-10 font-medium">
              V2 Prototype: Empower your health journey with Dehapa Hub. Find doctors, book hospitals, and order medicines instantly.
            </p>

            {/* Placeholder for V2 Search Bar */}
            <div className="w-full relative shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-xl bg-white/90 backdrop-blur-xl border border-white flex items-center p-3 h-16">
               <span className="text-slate-400 font-bold ml-4">V2 Custom Search Bar will be rebuilt here...</span>
            </div>
          </div>

        </div>
      </section>

      {/* V2 Browse Categories (Strict Grid Cards) */}
      <section className="w-full flex justify-center py-12 px-4 sm:px-8 lg:px-16 bg-white">
        <div className="w-full max-w-[1400px]">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Grid Card Prototype */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <Search className="w-6 h-6" />
              </div>
              <span className="font-bold text-slate-700">Doctors</span>
            </div>
            {/* Replicate for others... */}
          </div>
        </div>
      </section>

    </div>
  );
}
