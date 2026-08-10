export type TaxonomyGroup = "GENERAL" | "SPECIALIST" | "SUPER_SPECIALIST";

export const TAXONOMY_MAPPING: Record<string, TaxonomyGroup> = {
  // Group A: General
  "General Physician": "GENERAL",
  "MBBS": "GENERAL",
  "Family Medicine": "GENERAL",
  "AYUSH": "GENERAL",
  "Homeopathy": "GENERAL",
  "Ayurveda": "GENERAL",

  // Group B: Specialist
  "Medicine": "SPECIALIST",
  "Orthopedic": "SPECIALIST",
  "Gynecology": "SPECIALIST",
  "Pediatrics": "SPECIALIST",
  "Dermatology": "SPECIALIST",
  "ENT": "SPECIALIST",
  "Ophthalmology": "SPECIALIST",
  "Psychiatry": "SPECIALIST",
  "Dentist": "SPECIALIST",

  // Group C: Super Specialist
  "Cardiology": "SUPER_SPECIALIST",
  "Nephrology": "SUPER_SPECIALIST",
  "Neurology": "SUPER_SPECIALIST",
  "Plastic Surgery": "SUPER_SPECIALIST",
  "Oncology": "SUPER_SPECIALIST",
  "Urology": "SUPER_SPECIALIST",
  "Gastroenterology": "SUPER_SPECIALIST",
  "Endocrinology": "SUPER_SPECIALIST",
};

/**
 * Helper function to determine the taxonomy group of a specialty string.
 * Defaults to "SPECIALIST" if not found in the mapping.
 */
export function getTaxonomyGroup(specialty: string): TaxonomyGroup {
  return TAXONOMY_MAPPING[specialty] || "SPECIALIST";
}
