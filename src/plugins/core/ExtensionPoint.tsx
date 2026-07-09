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
export function ExtensionPoint({ name, className = "", ...props }: ExtensionPointProps) {
  const { activePlugins, loading } = usePluginEngine();
  const allPlugins = PluginRegistry.getPluginsForExtensionPoint(name);
  
  // Filter dynamically based on real-time database state
  const activePluginsForSocket = allPlugins.filter(plugin => {
    // If not found in DB yet, fallback to its static default
    const isEnabledInDb = activePlugins[plugin.id];
    return isEnabledInDb !== undefined ? isEnabledInDb : plugin.enabled;
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
