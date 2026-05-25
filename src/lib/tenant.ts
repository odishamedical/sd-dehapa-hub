export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  domainKeyword: string;
  accentColor: string;
  accentColorGlow: string;
  gradientFrom: string;
  gradientTo: string;
  logoText: string;
  logoSubText: string;
  hospitalName: string;
  tagline: string;
  description: string;
}

export const TENANTS: Record<string, TenantConfig> = {
  general: {
    id: "general",
    name: "DehaPa Health",
    slug: "general",
    domainKeyword: "dehapa",
    accentColor: "#06b6d4",
    accentColorGlow: "rgba(6, 182, 212, 0.2)",
    gradientFrom: "#06b6d4",
    gradientTo: "#0d9488",
    logoText: "DehaPa",
    logoSubText: "Sovereign Medical Network",
    hospitalName: "All",
    tagline: "Healthcare Without Boundaries.",
    description: "The next-generation health operating system for the SD Ecosystem. Secure patient records, real-time video consultations, and AI-driven diagnostics."
  },
  apollo: {
    id: "apollo",
    name: "Apollo Hospitals",
    slug: "apollo",
    domainKeyword: "apollo",
    accentColor: "#10b981", // Emerald Green
    accentColorGlow: "rgba(16, 185, 129, 0.2)",
    gradientFrom: "#10b981",
    gradientTo: "#059669",
    logoText: "Apollo",
    logoSubText: "Health & Tele-Consultation",
    hospitalName: "Apollo Hospitals, Bhubaneswar",
    tagline: "Touching Lives, Healing Hearts.",
    description: "Access world-class healthcare from Apollo Hospitals Bhubaneswar. Consult top cardiologists, orthopedic surgeons, and emergency specialists online."
  },
  kims: {
    id: "kims",
    name: "KIMS Medical Center",
    slug: "kims",
    domainKeyword: "kims",
    accentColor: "#2563eb", // Royal Blue
    accentColorGlow: "rgba(37, 99, 235, 0.2)",
    gradientFrom: "#2563eb",
    gradientTo: "#1d4ed8",
    logoText: "KIMS",
    logoSubText: "Institute of Medical Sciences",
    hospitalName: "KIMS, Bhubaneswar",
    tagline: "Pioneering Care. Empowering Health.",
    description: "Secure, state-of-the-art tele-consultations directly with KIMS faculty, pediatricians, and clinical experts at the Kalinga Institute of Medical Sciences."
  },
  care: {
    id: "care",
    name: "Care Outpatient Clinic",
    slug: "care",
    domainKeyword: "care",
    accentColor: "#8b5cf6", // Violet Purple
    accentColorGlow: "rgba(139, 92, 246, 0.2)",
    gradientFrom: "#8b5cf6",
    gradientTo: "#7c3aed",
    logoText: "Care",
    logoSubText: "Outpatient Care & Dermatology",
    hospitalName: "Care Hospitals, Cuttack",
    tagline: "Compassionate Care. Close to Home.",
    description: "Direct patient care portal for Care Hospitals Cuttack. Request prescription refills, book appointments, and access your medical vaults instantly."
  }
};

export function resolveTenantConfig(hostname?: string, queryTenant?: string | null): TenantConfig {
  // 1. Check query parameter override first (useful for localhost testing)
  if (queryTenant && TENANTS[queryTenant.toLowerCase()]) {
    return TENANTS[queryTenant.toLowerCase()];
  }

  // 2. Fallback to parsing the hostname
  if (hostname) {
    const parts = hostname.toLowerCase().split(".");
    for (const part of parts) {
      if (TENANTS[part]) {
        return TENANTS[part];
      }
    }
  }

  // 3. Fallback to default General DehaPa theme
  return TENANTS.general;
}
