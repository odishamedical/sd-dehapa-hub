export default function V2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="v2-root min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 
        TODO: V2 Glassmorphic Header will go here. 
      */}
      <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 h-20 flex items-center px-8 shadow-sm">
        <div className="font-black text-2xl tracking-tight text-slate-900">
          dehapa<span className="text-blue-600">.v2</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
