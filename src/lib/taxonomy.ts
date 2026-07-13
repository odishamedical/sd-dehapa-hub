export const DOCTOR_TAXONOMY = {
  ayush: [
    "Ayurvedic Doctor",
    "Homeopath",
    "Yoga and Naturopathy",
    "Unani Specialist",
    "Siddha Practitioner"
  ],
  mbbs: [
    "General Physician",
    "Family Medicine",
    "General Practitioner"
  ],
  specialist: [
    "Pediatrician",
    "Gynecologist",
    "Orthopedic Surgeon",
    "Dermatologist",
    "ENT Specialist",
    "Ophthalmologist",
    "Psychiatrist",
    "Pulmonologist",
    "General Surgeon"
  ],
  "super-specialist": [
    "Cardiologist",
    "Neurologist",
    "Oncologist",
    "Gastroenterologist",
    "Endocrinologist",
    "Nephrologist",
    "Urologist",
    "Rheumatologist",
    "Neurosurgeon",
    "Cardiothoracic Surgeon"
  ]
};

// Helper function to get all specialties flatly
export function getAllSpecialties() {
  return [
    ...DOCTOR_TAXONOMY.ayush,
    ...DOCTOR_TAXONOMY.mbbs,
    ...DOCTOR_TAXONOMY.specialist,
    ...DOCTOR_TAXONOMY["super-specialist"]
  ];
}

// Helper to determine taxonomy category from specialty string
export function getTaxonomyCategory(specialty: string): string | null {
  for (const [category, specialties] of Object.entries(DOCTOR_TAXONOMY)) {
    if (specialties.includes(specialty)) {
      return category;
    }
  }
  return null;
}
