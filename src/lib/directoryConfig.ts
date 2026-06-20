export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'object_array' | 'string_array';
  placeholder?: string;
  options?: string[]; // For select type
  arrayFields?: { key: string; label: string; type: string }[]; // For object_array type
}

export interface TabConfig {
  id: string;
  label: string;
  fields: FieldConfig[];
}

export interface CategoryConfig {
  name: string;
  tabs: TabConfig[];
}

export const directoryConfig: Record<string, CategoryConfig> = {
  Doctor: {
    name: "Doctor",
    tabs: [
      {
        id: "professional",
        label: "Professional & Services",
        fields: [
          {
            key: "experiences",
            label: "Professional Experience",
            type: "object_array",
            arrayFields: [
              { key: "role", label: "Role / Position", type: "text" },
              { key: "hospital", label: "Hospital / Institution", type: "text" },
              { key: "duration", label: "Duration (e.g. 2010 - Present)", type: "text" },
              { key: "description", label: "Description", type: "textarea" }
            ]
          },
          {
            key: "qualificationsList",
            label: "Qualifications & Education",
            type: "object_array",
            arrayFields: [
              { key: "degree", label: "Degree / Certification", type: "text" },
              { key: "institution", label: "Institution / University", type: "text" },
              { key: "year", label: "Year of Completion", type: "text" }
            ]
          },
          {
            key: "research",
            label: "Research & Publications",
            type: "object_array",
            arrayFields: [
              { key: "title", label: "Title of Paper/Research", type: "text" },
              { key: "journal", label: "Journal / Publication", type: "text" },
              { key: "year", label: "Year", type: "text" },
              { key: "link", label: "Link (Optional)", type: "text" }
            ]
          },
          {
            key: "awards",
            label: "Awards & Recognitions",
            type: "object_array",
            arrayFields: [
              { key: "title", label: "Award Title", type: "text" },
              { key: "organization", label: "Issuing Organization", type: "text" },
              { key: "year", label: "Year", type: "text" }
            ]
          }
        ]
      }
    ]
  },
  Hospital: {
    name: "Hospital",
    tabs: [
      {
        id: "professional",
        label: "Professional & Services",
        fields: [
          {
            key: "departments",
            label: "Departments & Centers of Excellence",
            type: "object_array",
            arrayFields: [
              { key: "name", label: "Department Name (e.g. Cardiology)", type: "text" },
              { key: "head", label: "Head of Department", type: "text" },
              { key: "description", label: "Description", type: "textarea" }
            ]
          },
          {
            key: "healthPackages",
            label: "Health Packages & Preventive Care",
            type: "object_array",
            arrayFields: [
              { key: "name", label: "Package Name", type: "text" },
              { key: "price", label: "Price (₹)", type: "text" },
              { key: "features", label: "Features (Comma separated)", type: "textarea" }
            ]
          }
        ]
      },
      {
        id: "basic",
        label: "Basic Info",
        fields: [
          { key: "totalBeds", label: "Total Beds", type: "text", placeholder: "e.g. 500" },
          { key: "icuCapacity", label: "ICU Capacity", type: "text", placeholder: "e.g. 50" },
          { key: "emergencyServices", label: "Emergency Services", type: "text", placeholder: "e.g. 24/7 Available" }
        ]
      }
    ]
  },
  Pharmacy: {
    name: "Pharmacy",
    tabs: [
      {
        id: "professional",
        label: "Professional & Services",
        fields: [
          { key: "businessType", label: "Business Type", type: "select", options: ["Retail Pharmacy", "Wholesaler / Distributor", "Pharma Manufacturer"] },
          { key: "gstin", label: "GSTIN Number", type: "text" },
          { key: "retailLicense", label: "Retail Drug License No.", type: "text" },
          { key: "wholesaleLicense", label: "Wholesale Drug License No.", type: "text" },
          { key: "manufacturingLicense", label: "Manufacturing License No.", type: "text" },
          { key: "homeDeliveryRadius", label: "Home Delivery Radius", type: "text", placeholder: "e.g. 5 KM" },
          { key: "is247", label: "Open 24/7", type: "boolean" },
          { key: "timings", label: "Timings", type: "text", placeholder: "e.g. Mon-Sat 8AM - 9PM" }
        ]
      }
    ]
  },
  Lab: {
    name: "Lab",
    tabs: [
      {
        id: "professional",
        label: "Professional & Services",
        fields: [
          { key: "labType", label: "Lab Type", type: "select", options: ["Pathology", "Radiology", "Blood Bank"] },
          { key: "accreditations", label: "Accreditations (e.g. NABL)", type: "string_array", placeholder: "Add accreditation" },
          { key: "homeCollection", label: "Home Sample Collection", type: "boolean" },
          { key: "is247", label: "Open 24/7", type: "boolean" },
          { key: "timings", label: "Timings", type: "text", placeholder: "e.g. Mon-Sat 8AM - 9PM" }
        ]
      }
    ]
  },
  Ambulance: {
    name: "Ambulance",
    tabs: [
      {
        id: "professional",
        label: "Professional & Services",
        fields: [
          { key: "ambulanceType", label: "Ambulance Type", type: "select", options: ["Basic Life Support (BLS)", "Advanced Life Support (ALS)", "Patient Transport Vehicle"] },
          { key: "fleetSize", label: "Fleet Size", type: "number", placeholder: "e.g. 5" },
          { key: "oxygenAvailable", label: "Oxygen Available", type: "boolean" },
          { key: "ventilatorAvailable", label: "Ventilator Available", type: "boolean" },
          { key: "is247", label: "Available 24/7", type: "boolean" },
          { key: "baseLocation", label: "Base Location / Station", type: "text" }
        ]
      }
    ]
  }
};
