import type { Metadata } from "next";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";
import TenantProvider from "@/components/TenantContext";

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
import GlobalFooter from "@/components/GlobalFooter";
import GlobalTelemedicineFAB from "@/components/GlobalTelemedicineFAB";
import DoctorCommandDock from "@/components/DoctorCommandDock";
import UserPresenceProvider from "@/components/UserPresenceProvider";

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
      <body className="min-h-full flex flex-col font-sans overflow-x-clip md:pb-0 pb-[80px]">
        <TenantProvider>
          <UserPresenceProvider />
          <GlobalHeader activeProject="Telemedicine" />
          <div className="flex-1">
            {children}
          </div>
          <GlobalFooter />
          <GlobalScannerController />
          <GlobalTelemedicineFAB />
          <DoctorCommandDock />
        </TenantProvider>
      </body>
    </html>
  );
}

