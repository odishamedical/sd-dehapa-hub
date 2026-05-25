"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TenantConfig, resolveTenantConfig, TENANTS } from "../lib/tenant";

interface TenantContextType {
  activeTenant: TenantConfig;
  isLoaded: boolean;
}

const TenantContext = createContext<TenantContextType>({
  activeTenant: TENANTS.general,
  isLoaded: false
});

export const useTenant = () => useContext(TenantContext);

export default function TenantProvider({ children }: { children: React.ReactNode }) {
  const [activeTenant, setActiveTenant] = useState<TenantConfig>(TENANTS.general);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const params = new URLSearchParams(window.location.search);
      const queryTenant = params.get("tenant");
      
      const config = resolveTenantConfig(hostname, queryTenant);
      setActiveTenant(config);
      setIsLoaded(true);

      // Inject CSS variables into document element
      const root = document.documentElement;
      root.style.setProperty("--tenant-accent", config.accentColor);
      root.style.setProperty("--tenant-accent-glow", config.accentColorGlow);
      root.style.setProperty("--tenant-gradient-from", config.gradientFrom);
      root.style.setProperty("--tenant-gradient-to", config.gradientTo);
    }
  }, []);

  return (
    <TenantContext.Provider value={{ activeTenant, isLoaded }}>
      {children}
    </TenantContext.Provider>
  );
}
