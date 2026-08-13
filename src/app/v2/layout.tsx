import V2Header from "./components/V2Header";

export default function V2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="v2-root min-h-screen bg-gradient-to-br from-[#bcedf5] via-[#d0f3f6] to-[#80c8dc] flex flex-col font-sans relative overflow-hidden">
      
      {/* Dynamic Aurora Mesh Background - FIXED to viewport */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[70vw] h-[70vh] bg-teal-400/50 rounded-full blur-[140px]"></div>
        <div className="absolute top-[30%] right-[-10%] w-[60vw] h-[60vh] bg-blue-500/40 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[80vh] bg-cyan-400/50 rounded-full blur-[160px]"></div>
        <div className="absolute top-[60%] right-[30%] w-[50vw] h-[50vh] bg-indigo-400/40 rounded-full blur-[150px]"></div>
      </div>
      
      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <V2Header />

        <main className="flex-1 flex flex-col pt-20">
          {children}
        </main>
      </div>
    </div>
  );
}
