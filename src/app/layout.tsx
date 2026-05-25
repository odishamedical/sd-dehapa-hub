import type { Metadata } from "next";
import "./globals.css";
import GlobalHeader from "@/components/GlobalHeader";
import TenantProvider from "@/components/TenantContext";

export const metadata: Metadata = {
  title: "DehaPa Health OS",
  description: "Next-Gen Telemedicine & Patient Portal",
};

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
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}

