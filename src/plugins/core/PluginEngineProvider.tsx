"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PluginRegistry } from './PluginRegistry';
import { useTenant } from '@/components/TenantContext';
import { initializePlugins } from '@/plugins';

// Ensure plugins are initialized in the client browser memory
initializePlugins();


interface PluginEngineContextType {
  activePlugins: Record<string, boolean>; // e.g. { 'vitals.compact': true, 'rx.auto_suggest': false }
  loading: boolean;
}

const PluginEngineContext = createContext<PluginEngineContextType>({
  activePlugins: {},
  loading: true
});

export const usePluginEngine = () => useContext(PluginEngineContext);

export function PluginEngineProvider({ children }: { children: React.ReactNode }) {
  const [activePlugins, setActivePlugins] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { activeTenant, isLoaded: isTenantLoaded } = useTenant();

  useEffect(() => {
    if (!isTenantLoaded) return;

    // Use tenant specific config, fallback to global_config if tenant has no specific overrides yet
    const docId = activeTenant.slug === 'general' ? 'global_config' : activeTenant.slug;
    const docRef = doc(db, 'plugin_settings', docId);
    
    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        setActivePlugins(snapshot.data() as Record<string, boolean>);
        setLoading(false);
      } else {
        // Document doesn't exist yet, initialize it based on the static registry defaults
        const allPlugins = PluginRegistry.getAllPlugins();
        const initialConfig: Record<string, boolean> = {};
        allPlugins.forEach(p => {
          initialConfig[p.id] = p.enabled;
        });
        
        try {
          await setDoc(docRef, initialConfig);
          setActivePlugins(initialConfig);
        } catch (e) {
          console.error("Failed to initialize plugin config", e);
          // Fallback to local
          setActivePlugins(initialConfig);
        }
        setLoading(false);
      }
    }, (error) => {
      console.error("Error listening to plugin config:", error);
      // Fallback
      const allPlugins = PluginRegistry.getAllPlugins();
      const initialConfig: Record<string, boolean> = {};
      allPlugins.forEach(p => { initialConfig[p.id] = p.enabled; });
      setActivePlugins(initialConfig);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTenant.slug, isTenantLoaded]);

  return (
    <PluginEngineContext.Provider value={{ activePlugins, loading }}>
      {children}
    </PluginEngineContext.Provider>
  );
}
