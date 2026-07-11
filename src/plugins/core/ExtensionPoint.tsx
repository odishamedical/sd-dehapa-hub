"use client";

import React from 'react';
import { PluginRegistry } from './PluginRegistry';
import { usePluginEngine } from './PluginEngineProvider';

interface ExtensionPointProps {
  name: string;
  className?: string;
  // Allows passing custom props directly to plugins if needed, 
  // though Context is preferred for state.
  [key: string]: any; 
}

/**
 * ExtensionPoint acts as an invisible socket in the UI.
 * Any plugin registered to this `name` will be automatically injected here.
 */
// Translation Matrix mapping SaaS Subscription Plugins -> Engine Plugin IDs
const SAAS_TO_ENGINE_MAP: Record<string, string[]> = {
  'plugin_vip_rx_pad': ['core.vitals', 'core.memory_tags', 'core.smart_medicine', 'core.whatsapp_dispatch', 'core.ai_diagnosis'],
  // Add other mappings here as needed
};

export function ExtensionPoint({ name, className = "", provider, ...props }: ExtensionPointProps) {
  const { activePlugins: globalPlugins, loading } = usePluginEngine();
  const allPlugins = PluginRegistry.getPluginsForExtensionPoint(name);
  
  // Filter dynamically based on real-time database state + SaaS Subscription Translation
  const activePluginsForSocket = allPlugins.filter(plugin => {
    // 1. Is it globally killed by the Super Admin? (Master Switchboard)
    const isEnabledGlobally = globalPlugins[plugin.id] !== undefined ? globalPlugins[plugin.id] : plugin.enabled;
    if (!isEnabledGlobally) return false;

    // 2. Is there a provider SaaS subscription that unlocks this?
    if (provider?.activePlugins && Array.isArray(provider.activePlugins)) {
      // Find any SaaS plugin the provider bought that includes this engine plugin
      const hasSubscription = provider.activePlugins.some((saasId: string) => {
        const grantedEngineIds = SAAS_TO_ENGINE_MAP[saasId] || [];
        return grantedEngineIds.includes(plugin.id);
      });

      // If they bought the package that includes it, unlock it.
      if (hasSubscription) return true;

      // If it's a premium feature and they didn't buy it, keep it locked.
      // (Assuming all mapped engine plugins are premium by default if present in the map)
      const isPremiumFeature = Object.values(SAAS_TO_ENGINE_MAP).flat().includes(plugin.id);
      if (isPremiumFeature) return false;
    }

    // 3. Fallback: If not premium or no provider context, fallback to global state
    return isEnabledGlobally;
  });

  if (loading) {
    return null; // or a subtle skeleton
  }

  if (activePluginsForSocket.length === 0) {
    return null; 
  }

  return (
    <div className={`extension-point plugin-slot-${name} ${className}`}>
      {activePluginsForSocket.map((plugin) => {
        const PluginComponent = plugin.component;
        return <PluginComponent key={plugin.id} {...props} />;
      })}
    </div>
  );
}
