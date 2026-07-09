import { PluginRegistry } from './core/PluginRegistry';
import { VitalsPlugin } from './features/VitalsPlugin';
import { MemoryTagsPlugin } from './features/MemoryTagsPlugin';
import { SmartMedicinePlugin } from './features/SmartMedicinePlugin';
import { WhatsAppDispatchPlugin } from './features/WhatsAppDispatchPlugin';
import { MultiLingualPlugin } from './features/MultiLingualPlugin';
import { AIDiagnosisPlugin } from './features/AIDiagnosisPlugin';
import { SmartInventoryPlugin } from './features/SmartInventoryPlugin';
import { DeliveryDispatcherPlugin } from './features/DeliveryDispatcherPlugin';
import { LiveBedManagerPlugin } from './features/LiveBedManagerPlugin';
import { HomeCollectionRouterPlugin } from './features/HomeCollectionRouterPlugin';
import { ReportUploaderPlugin } from './features/ReportUploaderPlugin';
import { FamilyLinkedProfilesPlugin } from './features/FamilyLinkedProfilesPlugin';
import { SmartPillReminderPlugin } from './features/SmartPillReminderPlugin';

// Register all core ecosystem plugins here.
// This is the "Switchboard".

export function initializePlugins() {
  PluginRegistry.register({
    id: 'core.vitals',
    name: 'Compact Vitals Row',
    description: 'HealthPlix-style compact vitals row',
    version: '1.0.0',
    targetExtensionPoint: 'rx_pad_header', // Matches <ExtensionPoint name="rx_pad_header" />
    component: VitalsPlugin,
    enabled: true
  });

  PluginRegistry.register({
    id: 'core.memory_tags',
    name: 'Smart Memory Tags',
    description: '1-click complaints and diagnosis from doctor memory',
    version: '1.0.0',
    targetExtensionPoint: 'rx_pad_body', // Matches <ExtensionPoint name="rx_pad_body" />
    component: MemoryTagsPlugin,
    enabled: true
  });

  PluginRegistry.register({
    id: 'core.smart_medicine',
    name: 'Auto-Suggest Engine',
    description: 'Auto-completes medicines, dosages, and durations from doctor memory',
    version: '1.0.0',
    targetExtensionPoint: 'rx_pad_medications', 
    component: SmartMedicinePlugin,
    enabled: true
  });

  PluginRegistry.register({
    id: 'core.whatsapp_dispatch',
    name: '1-Click WhatsApp Dispatch',
    description: 'Instantly sends prescription securely via WhatsApp',
    version: '1.0.0',
    targetExtensionPoint: 'rx_pad_actions', 
    component: WhatsAppDispatchPlugin,
    enabled: true
  });

  PluginRegistry.register({
    id: 'core.multilingual',
    name: 'Multi-Lingual Translation',
    description: 'Translates prescriptions to local languages',
    version: '1.0.0',
    targetExtensionPoint: 'rx_pad_actions', 
    component: MultiLingualPlugin,
    enabled: true
  });

  PluginRegistry.register({
    id: 'core.ai_diagnosis',
    name: 'AI Diagnosis Assistant',
    description: 'Suggests diagnosis based on chief complaints',
    version: '1.0.0',
    targetExtensionPoint: 'rx_pad_notes_actions', 
    component: AIDiagnosisPlugin,
    enabled: true
  });

  PluginRegistry.register({
    id: 'pharmacy.smart_inventory',
    name: 'Smart Inventory Toggles',
    description: 'Toggle medicine availability for public directory',
    version: '1.0.0',
    targetExtensionPoint: 'pharmacy_inventory', 
    component: SmartInventoryPlugin,
    enabled: true
  });

  PluginRegistry.register({
    id: 'pharmacy.delivery_dispatcher',
    name: 'Delivery Dispatcher',
    description: 'Auto-assign orders to delivery partners',
    version: '1.0.0',
    targetExtensionPoint: 'pharmacy_dispatch_actions', 
    component: DeliveryDispatcherPlugin,
    enabled: true
  });

  PluginRegistry.register({
    id: 'hospital.bed_manager',
    name: 'Live Bed Manager',
    description: 'Manage hospital beds in real-time',
    version: '1.0.0',
    targetExtensionPoint: 'hospital_bed_manager', 
    component: LiveBedManagerPlugin,
    enabled: true
  });

  PluginRegistry.register({
    id: 'lab.home_collection',
    name: 'Home Collection Router',
    description: 'Manage routes for phlebotomists',
    version: '1.0.0',
    targetExtensionPoint: 'lab_home_collection', 
    component: HomeCollectionRouterPlugin,
    enabled: true
  });

  PluginRegistry.register({
    id: 'lab.report_uploader',
    name: '1-Click Report Uploader',
    description: 'Push lab reports directly to patient vault',
    version: '1.0.0',
    targetExtensionPoint: 'lab_report_uploader', 
    component: ReportUploaderPlugin,
    enabled: true
  });

  PluginRegistry.register({
    id: 'vault.family_profiles',
    name: 'Family Linked Profiles',
    description: 'View medical records for dependents',
    version: '1.0.0',
    targetExtensionPoint: 'vault_sidebar_widgets', 
    component: FamilyLinkedProfilesPlugin,
    enabled: true
  });

  PluginRegistry.register({
    id: 'vault.smart_reminders',
    name: 'Smart Pill Reminder',
    description: 'Auto-reminders for active prescriptions',
    version: '1.0.0',
    targetExtensionPoint: 'vault_sidebar_widgets', 
    component: SmartPillReminderPlugin,
    enabled: true
  });
}
