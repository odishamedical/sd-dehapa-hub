import V2Header from "./components/V2Header";

export default function V2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="v2-root min-h-screen bg-slate-50 flex flex-col font-sans">
      
      <V2Header />

      <main className="flex-1 flex flex-col pt-20">
        {children}
      </main>
    </div>
  );
}
