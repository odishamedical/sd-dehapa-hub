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
  "Gynecologist": "SPECIALIST",
  "Pediatrics": "SPECIALIST",
  "Pediatrician": "SPECIALIST",
  "Dermatology": "SPECIALIST",
  "Dermatologist": "SPECIALIST",
  "ENT": "SPECIALIST",
  "Ophthalmology": "SPECIALIST",
  "Ophthalmologist": "SPECIALIST",
  "Psychiatry": "SPECIALIST",
  "Psychiatrist": "SPECIALIST",
  "Dentist": "SPECIALIST",

  // Group C: Super Specialist
  "Cardiology": "SUPER_SPECIALIST",
  "Cardiologist": "SUPER_SPECIALIST",
  "Nephrology": "SUPER_SPECIALIST",
  "Nephrologist": "SUPER_SPECIALIST",
  "Neurology": "SUPER_SPECIALIST",
  "Neurologist": "SUPER_SPECIALIST",
  "Plastic Surgery": "SUPER_SPECIALIST",
  "Oncology": "SUPER_SPECIALIST",
  "Oncologist": "SUPER_SPECIALIST",
  "Urology": "SUPER_SPECIALIST",
  "Urologist": "SUPER_SPECIALIST",
  "Gastroenterology": "SUPER_SPECIALIST",
  "Gastroenterologist": "SUPER_SPECIALIST",
  "Endocrinology": "SUPER_SPECIALIST",
  "Endocrinologist": "SUPER_SPECIALIST",
};

/**
 * Helper function to determine the taxonomy group of a specialty string.
 * Defaults to "SPECIALIST" if not found in the mapping.
 */
export function getTaxonomyGroup(specialty: string): TaxonomyGroup {
  return TAXONOMY_MAPPING[specialty] || "SPECIALIST";
}
