import React from "react";
import V2Hero from "@/components/v2/V2Hero";
import Link from "next/link";
import { Search } from "lucide-react";

export default function ClaimListingPage() {
  return (
    <div className="flex flex-col w-full min-h-screen text-slate-800 font-sans pb-24 relative z-10">
      <V2Hero 
        titleStart="Claim Your"
        highlight="Public Profile"
        subtitle="Take control of your directory listing. Update your timings, receive direct appointments, and earn the Verified Trust Badge."
        showSearch={false}
        desktopBgImage="/pc-hero.png" 
        mobileBgImage="/phone-hero.png"
      />

      <section className="relative z-10 w-full px-4 md:px-8 max-w-4xl mx-auto -mt-16 text-center">
         <div className="bg-white/60 backdrop-blur-3xl border border-white/80 shadow-[0_20px_50px_-12px_rgba(0,20,60,0.15)] rounded-[32px] p-8 md:p-16">
            <h2 className="text-3xl font-black text-[#0a2540] mb-6">How to Claim Your Profile</h2>
            <p className="text-slate-600 font-medium text-lg mb-10 max-w-2xl mx-auto">
              To ensure the highest level of security, we require all healthcare providers to claim their profiles directly from their public listing page.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex flex-col items-center max-w-xs text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-2xl font-black">1</div>
                <h3 className="font-bold text-slate-800 mb-2">Search the Directory</h3>
                <p className="text-sm text-slate-500">Find your name or clinic in our global healthcare directory.</p>
              </div>
              <div className="hidden sm:block text-slate-300">➜</div>
              <div className="flex flex-col items-center max-w-xs text-center">
                <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4 text-2xl font-black">2</div>
                <h3 className="font-bold text-slate-800 mb-2">Click Claim Listing</h3>
                <p className="text-sm text-slate-500">Click the Claim button on your profile and provide your Medical Registration Number.</p>
              </div>
            </div>

            <Link href="/directory" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-10 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1 mt-12">
               <Search className="w-5 h-5" /> Go to Directory
            </Link>
         </div>
      </section>
    </div>
  );
}
