import V2Header from "./components/V2Header";

export default function V2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="v2-root min-h-screen bg-gradient-to-br from-[#cff3f8] via-[#e2f9fb] to-[#91d1e4] flex flex-col font-sans relative overflow-hidden">
      
      {/* Sweeping Light Rays (Crucial for Glass Distortion) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-teal-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <V2Header />

      <main className="flex-1 flex flex-col pt-20">
        {children}
      </main>
    </div>
  );
}
