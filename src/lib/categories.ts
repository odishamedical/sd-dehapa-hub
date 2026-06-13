export const platformCategories = [
  "Doctor",
  "Hospital",
  "Lab",
  "Pharmacy",
  "Ambulance"
];

export const subCategoriesByCategory: Record<string, string[]> = {
  "Doctor": [
    "Medicine Specialist",
    "Cardiologist",
    "Neurologist",
    "Pediatrician",
    "Gynecologist",
    "Orthopedic",
    "Dermatologist",
    "Psychiatrist",
    "Dentist",
    "Ophthalmologist",
    "ENT Specialist",
    "General Physician"
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
