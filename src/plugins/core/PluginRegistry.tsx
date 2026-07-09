import React from 'react';

export interface PluginDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  targetExtensionPoint: string;
  component: React.ComponentType<any>;
  enabled: boolean;
}

class PluginRegistryClass {
  private plugins: Map<string, PluginDefinition> = new Map();

  register(plugin: PluginDefinition) {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already registered.`);
      return;
    }
    this.plugins.set(plugin.id, plugin);
    console.log(`[Plugin System] Registered: ${plugin.name} -> Socked to: ${plugin.targetExtensionPoint}`);
  }

  unregister(pluginId: string) {
    this.plugins.delete(pluginId);
  }

  getPluginsForExtensionPoint(extensionPoint: string): PluginDefinition[] {
    return Array.from(this.plugins.values()).filter(
      (p) => p.targetExtensionPoint === extensionPoint && p.enabled
    );
  }

  getAllPlugins(): PluginDefinition[] {
    return Array.from(this.plugins.values());
  }
}

// Singleton pattern
export const PluginRegistry = new PluginRegistryClass();
