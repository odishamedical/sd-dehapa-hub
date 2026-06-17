import type { Metadata } from "next";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";
import TenantProvider from "@/components/TenantContext";

export const metadata: Metadata = {
  title: "DehaPa Health OS",
  description: "Next-Gen Telemedicine & Patient Portal",
};

import GlobalScannerController from "@/components/GlobalScannerController";
import GlobalFooter from "@/components/GlobalFooter";
import GlobalTelemedicineFAB from "@/components/GlobalTelemedicineFAB";
import DoctorCommandDock from "@/components/DoctorCommandDock";

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
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">
        <TenantProvider>
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

