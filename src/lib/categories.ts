export const platformCategories = [
  "Doctor",
  "Hospital",
  "Lab",
  "Pharmacy",
  "Ambulance"
];

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
    "General Surgeon",
    "Medicine Specialist",
    "Dentist"
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

export function getTaxonomyCategory(specialty: string): string | null {
  for (const [category, specialties] of Object.entries(DOCTOR_TAXONOMY)) {
    if (specialties.includes(specialty)) {
      return category;
    }
  }
  return null;
}

export const subCategoriesByCategory: Record<string, string[]> = {
  "Doctor": [
    ...DOCTOR_TAXONOMY.ayush,
    ...DOCTOR_TAXONOMY.mbbs,
    ...DOCTOR_TAXONOMY.specialist,
    ...DOCTOR_TAXONOMY["super-specialist"]
  ],
  "Hospital": [
    "Multispecialty Hospital",
    "General Hospital",
    "Maternity Hospital",
    "Children's Hospital",
    "Cancer Hospital",
    "Eye Hospital",
    "Ayurvedic Hospital",
    "Homeopathic Hospital"
  ],
  "Lab": [
    "Pathology Lab",
    "Radiology & Imaging",
    "Diagnostic Center",
    "Blood Bank"
  ],
  "Pharmacy": [
    "Retail Pharmacy",
    "Wholesale Pharmacy",
    "Ayurvedic Pharmacy",
    "24/7 Medical Store"
  ],
  "Ambulance": [
    "Basic Life Support (BLS)",
    "Advanced Life Support (ALS)",
    "Patient Transport Vehicle",
    "Neonatal Ambulance"
  ]
};
