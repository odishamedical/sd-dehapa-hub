import Image from "next/image";
import EcosystemSwitcher from "../components/EcosystemSwitcher";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Soft Background Decor */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-cyan-100/50 blur-[150px] rounded-full z-0" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-100/50 blur-[150px] rounded-full z-0" />

      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">D</div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">DEHAPA <span className="text-cyan-600">HEALTH</span></span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
          <a href="#" className="hover:text-cyan-600 transition-colors">Telemedicine</a>
          <a href="#" className="hover:text-cyan-600 transition-colors">Patient Portal</a>
          <a href="#" className="hover:text-cyan-600 transition-colors">Medplum Cloud</a>
        </nav>
        <div className="flex items-center gap-3">
          <EcosystemSwitcher />
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              LIVE TELEMEDICINE OS
            </div>
            
            <h1 className="text-6xl font-bold text-slate-900 leading-[1.1] mb-8">
              Healthcare <br />
              <span className="text-cyan-600">Without Boundaries.</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 max-w-lg">
              The next-generation health operating system for the SD Ecosystem. 
              Secure patient records, real-time video consultations, and 
              AI-driven diagnostics—powered by Medplum.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-200">
                Register as Patient
              </button>
              <button className="px-8 py-4 bg-white border border-slate-200 hover:border-cyan-300 text-slate-900 font-bold rounded-2xl transition-all">
                Schedule Consultation
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-8">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200" />
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                <span className="text-slate-900 font-bold">2,400+</span> Specialized Doctors Online
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 bg-cyan-200/30 blur-[100px] rounded-full" />
            <div className="relative rounded-[40px] border-[12px] border-white shadow-2xl shadow-cyan-900/10 overflow-hidden bg-white">
              <Image 
                src="/dehapa-preview.png" 
                alt="Dehapa Health OS Interface" 
                width={800} 
                height={1000} 
                className="object-cover"
              />
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
