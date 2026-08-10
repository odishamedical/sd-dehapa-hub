import V2Header from "./components/V2Header";

export default function V2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="v2-root min-h-screen bg-gradient-to-br from-[#cff3f8] via-[#e2f9fb] to-[#91d1e4] flex flex-col font-sans relative overflow-hidden">
      
      {/* Sweeping Light Rays (Crucial for Glass Distortion) */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[50%] bg-white/20 -rotate-12 rounded-[100%] blur-[2px] pointer-events-none"></div>
      <div className="absolute top-[30%] left-[-20%] w-[140%] h-[20%] bg-blue-300/30 rotate-6 rounded-[100%] blur-[4px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[60%] bg-teal-200/40 -rotate-45 rounded-[100%] blur-[6px] pointer-events-none"></div>
      
      <V2Header />

      <main className="flex-1 flex flex-col pt-20">
        {children}
      </main>
    </div>
  );
}
