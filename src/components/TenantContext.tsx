"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TenantConfig, resolveTenantConfig, TENANTS } from "../lib/tenant";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
    let isMounted = true;
    
    const initializeTenant = async () => {
      if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        const params = new URLSearchParams(window.location.search);
        const queryTenant = params.get("tenant");
        
        // Try to resolve from hardcoded lib first (for fast loading of defaults)
        let config = resolveTenantConfig(hostname, queryTenant);
        
        // Search Firestore for a dynamic tenant matching the hostname (or query for testing)
        try {
          const searchDomain = queryTenant || hostname.split('.')[0];
          const q = query(collection(db, "tenants"), where("slug", "==", searchDomain));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            config = snapshot.docs[0].data() as TenantConfig;
          }
        } catch (e) {
          console.error("Failed to fetch dynamic tenant, falling back to local.", e);
        }

        if (isMounted) {
          setActiveTenant(config);
          setIsLoaded(true);

          // Inject CSS variables into document element
          const root = document.documentElement;
          root.style.setProperty("--tenant-accent", config.accentColor);
          root.style.setProperty("--tenant-accent-glow", config.accentColorGlow);
          root.style.setProperty("--tenant-gradient-from", config.gradientFrom);
          root.style.setProperty("--tenant-gradient-to", config.gradientTo);
        }
      }
    };

    initializeTenant();
    
    return () => { isMounted = false; };
  }, []);

  return (
    <TenantContext.Provider value={{ activeTenant, isLoaded }}>
      {children}
    </TenantContext.Provider>
  );
}
