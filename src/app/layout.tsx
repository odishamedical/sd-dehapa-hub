import type { Metadata } from "next";
import "./globals.css";
import V2Header from "@/components/v2/V2Header";
import V2Breadcrumbs from "@/components/v2/V2Breadcrumbs";
import TenantProvider from "@/components/TenantContext";
import { initializePlugins } from "@/plugins";
import { PluginEngineProvider } from "@/plugins/core/PluginEngineProvider";

// Boot up the Switchboard engine
if (typeof window !== 'undefined') {
  initializePlugins();
} else {
  // Ensure it also initializes in SSR
  initializePlugins();
}

export const metadata: Metadata = {
  title: "Dehapa | Your Health, Our Mission",
  description: "India's most trusted healthcare network. Instantly find and book verified top-rated doctors, premium hospitals, pharmacies, and emergency services near you.",
  openGraph: {
    title: "Dehapa | Your Health, Our Mission",
    description: "India's most trusted healthcare network. Instantly find and book verified top-rated doctors, premium hospitals, pharmacies, and emergency services near you.",
    url: 'https://dehapa.com',
    type: 'website',
    images: [{
      url: '/og-home.png',
      width: 1280,
      height: 720,
      alt: 'DehaPa Health Network'
    }]
  }
};

import GlobalScannerController from "@/components/GlobalScannerController";
import GlobalTelemedicineFAB from "@/components/GlobalTelemedicineFAB";
import DoctorCommandDock from "@/components/DoctorCommandDock";
import UserPresenceProvider from "@/components/UserPresenceProvider";
import GlobalFooter from "@/components/GlobalFooter";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
            window.location.href = window.location.href.replace('http:', 'https:');
          }
        `}} />
      </head>
      <body className="min-h-full font-sans overflow-x-clip m-0 p-0">
        <TenantProvider>
          <PluginEngineProvider>
            <UserPresenceProvider />
            
            {/* V2 Ecosystem Root Wrapper */}
            <div className="v2-root min-h-screen bg-gradient-to-br from-[#bcedf5] via-[#d0f3f6] to-[#80c8dc] flex flex-col relative overflow-x-hidden w-full">
              
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

                <main className="flex-1 flex flex-col pt-0 w-full">
                  <V2Breadcrumbs />
                  {children}
                </main>
              </div>
            </div>

            <GlobalFooter />
            <GlobalScannerController />
            <GlobalTelemedicineFAB />
            <DoctorCommandDock />
          </PluginEngineProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
