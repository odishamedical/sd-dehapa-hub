export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'object_array' | 'string_array' | 'entity_selector' | 'hybrid_entity_selector' | 'image_upload' | 'hybrid_test_array';
  placeholder?: string;
  options?: string[]; // For select type
  arrayFields?: { key: string; label: string; type: string, targetEntity?: string, placeholder?: string }[]; // For object_array type
  mandatory?: boolean;
  hiddenIf?: { field: string; in: string[] }; // Hide this field if the target field's value is in the array
  targetEntity?: string; // e.g. "Doctor", "Hospital" for entity_selector or hybrid_entity_selector
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
            key: "qualificationsList",
            label: "Qualifications & Education",
            type: "object_array",
            mandatory: true,
            arrayFields: [
              { key: "degree", label: "Degree (e.g., MBBS, MD)", type: "text" },
              { key: "institution", label: "Institution / University", type: "text" },
              { key: "year", label: "Passing Year", type: "text" }
            ]
          },
          {
            key: "primarySpecialty",
            label: "Primary Specialty",
            type: "text",
            mandatory: true,
            placeholder: "e.g., Cardiologist"
          },
          {
            key: "videoFee",
            label: "Video Consultation Fee (₹)",
            type: "number",
            mandatory: true,
            placeholder: "e.g., 500"
          },
          {
            key: "inClinicFee",
            label: "In-Clinic Consultation Fee (₹)",
            type: "number",
            mandatory: true,
            placeholder: "e.g., 800"
          },
          {
            key: "clinicTimings",
            label: "Clinic Timings (Supports Split Shifts)",
            type: "object_array",
            mandatory: true,
            arrayFields: [
              { key: "day", label: "Day (e.g., Monday)", type: "text" },
              { key: "morningShift", label: "Morning Shift (e.g., 9AM-1PM)", type: "text" },
              { key: "eveningShift", label: "Evening Shift (e.g., 5PM-9PM)", type: "text" }
            ]
          },
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
      },
      {
        id: "consultation_setup",
        label: "Consultation Setup",
        fields: [
          { key: "offersPhysical", label: "Offers Physical In-Clinic Consultations", type: "boolean", mandatory: true },
          { key: "offersDigital", label: "Offers Digital/Video Consultations", type: "boolean", mandatory: true },
          { key: "videoMeetingLink", label: "Default Video Meeting Link (e.g. Zoom/Meet)", type: "text", placeholder: "https://zoom.us/j/123456" }
        ]
      },
      {
        id: "bank_details",
        label: "Bank Details & Payouts",
        fields: [
          { key: "accountName", label: "Account Holder Name", type: "text", mandatory: true },
          { key: "bankName", label: "Bank Name", type: "text", mandatory: true },
          { key: "accountNumber", label: "Account Number", type: "text", mandatory: true },
          { key: "ifscCode", label: "IFSC Code", type: "text", mandatory: true },
          { key: "upiId", label: "UPI ID (Optional)", type: "text" }
        ]
      }
    ]
  },
  Hospital: {
    name: "Hospital",
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        fields: [
          { key: "facilityType", label: "Primary Facility Identity", type: "select", mandatory: true, options: ["Clinic", "Poly-Clinic", "Nursing Home", "Corporate Hospital", "Maternity Home", "Surgical Center"] },
          { key: "facadeImage", label: "Main Building / Facade Photo", type: "image_upload" },
          { key: "totalBeds", label: "Total Beds", type: "text", mandatory: true, placeholder: "e.g. 500", showIf: { field: "facilityType", contains: ["Nursing Home", "Corporate Hospital", "Maternity Home", "Surgical Center"] } },
          { key: "icuCapacity", label: "ICU Capacity", type: "text", mandatory: true, placeholder: "e.g. 50", showIf: { field: "facilityType", contains: ["Nursing Home", "Corporate Hospital", "Surgical Center"] } },
          { key: "emergencyServices", label: "Emergency Services", type: "text", mandatory: true, placeholder: "e.g. 24/7 Available" }
        ]
      },
      {
        id: "infrastructure",
        label: "Infrastructure & Facilities",
        fields: [
          { key: "additionalServices", label: "Add-On Services & Facilities", type: "string_array", placeholder: "Select Available Services", options: ["In-House Pharmacy", "Blood Bank", "Pathology Lab", "Diagnostic Imaging", "Ambulance Fleet", "24/7 Trauma Center"] },
          { key: "operationTheaters", label: "Number of Operation Theaters", type: "number", placeholder: "e.g. 4", showIf: { field: "facilityType", contains: ["Nursing Home", "Corporate Hospital", "Surgical Center", "Maternity Home"] } },
          { key: "icuImage", label: "ICU / Emergency Ward Photo", type: "image_upload", showIf: { field: "facilityType", contains: ["Nursing Home", "Corporate Hospital", "Surgical Center"] } }
        ]
      },
      {
        id: "accreditations_insurance",
        fields: [
          { key: "clinicalEstablishmentLicense", label: "Clinical Establishment License (Mandatory)", type: "image_upload", mandatory: true },
          { key: "bloodBankLicense", label: "Blood Bank License (Mandatory)", type: "image_upload", mandatory: true, showIf: { field: "additionalServices", contains: "Blood Bank" } },
          { key: "inHousePharmacyLicense", label: "In-House Pharmacy Retail License (Mandatory)", type: "image_upload", mandatory: true, showIf: { field: "additionalServices", contains: "In-House Pharmacy" } },
          { key: "accreditations", label: "Accreditations", type: "string_array", placeholder: "e.g. NABH, NABL, JCI", options: ["NABH", "NABL", "JCI", "ISO 9001", "ISO 27001", "Joint Commission International"] },
          { key: "insuranceTieUps", label: "Insurance & TPA Tie-Ups", type: "string_array", placeholder: "Type a provider or select", options: ["Ayushman Bharat (PM-JAY)", "ESI (Employees' State Insurance)", "CGHS", "Star Health Insurance", "HDFC ERGO General Insurance", "ICICI Lombard", "Bajaj Allianz", "Care Health Insurance", "Niva Bupa Health Insurance", "Aditya Birla Health Insurance", "SBI General Insurance", "Reliance General Insurance", "Tata AIG"] }
        ]
      },
      {
        id: "departments",
        label: "Departments & Roster",
        fields: [
          {
            key: "departments",
            label: "Departments",
            type: "object_array",
            arrayFields: [
              { key: "name", label: "Department Name (e.g. Cardiology)", type: "text" },
              { key: "head", label: "Head of Department", type: "text" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "departmentImage", label: "Department / Ward Photo", type: "image_upload" },
              {
                key: "roster",
                label: "Department Doctors",
                type: "hybrid_entity_selector",
                targetEntity: "Doctor",
                placeholder: "Search verified doctors..."
              }
            ]
          }
        ]
      },
      {
        id: "health_packages",
        label: "Health Packages & Preventive Care",
        fields: [
          {
            key: "healthPackages",
            label: "Health Packages",
            type: "object_array",
            arrayFields: [
              { key: "name", label: "Package Name", type: "text" },
              { key: "price", label: "Price (₹)", type: "text" },
              { key: "features", label: "Features (Comma separated)", type: "textarea" }
            ]
          }
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
          { key: "businessType", label: "Business Type", type: "string_array", mandatory: true, placeholder: "Select Business Types", options: ["Retail Pharmacy", "Wholesaler / Distributor", "Pharma Manufacturer"] },
          { key: "gstin", label: "GSTIN Number", type: "text", mandatory: true },
          { key: "retailLicense", label: "Retail Drug License No.", type: "text", showIf: { field: "businessType", contains: "Retail Pharmacy" }, mandatory: true },
          { key: "wholesaleLicense", label: "Wholesale Drug License No.", type: "text", showIf: { field: "businessType", contains: "Wholesaler / Distributor" }, mandatory: true },
          { key: "manufacturingLicense", label: "Manufacturing License No.", type: "text", showIf: { field: "businessType", contains: "Pharma Manufacturer" }, mandatory: true },
          { key: "homeDeliveryRadius", label: "Home Delivery Radius", type: "text", placeholder: "e.g. 5 KM", showIf: { field: "businessType", contains: "Retail Pharmacy" } },
          { key: "is247", label: "Open 24/7", type: "boolean", showIf: { field: "businessType", contains: "Retail Pharmacy" } },
          { key: "timings", label: "Timings", type: "text", placeholder: "e.g. Mon-Sat 8AM - 9PM" }
        ]
      }
    ]
  },
  Lab: {
    name: "Lab",
    tabs: [
      {
        id: "identity_infrastructure",
        label: "Identity & Infrastructure",
        fields: [
          { key: "labType", label: "Primary Lab Identity", type: "select", mandatory: true, options: ["Pathology", "Radiology & Imaging", "Integrated Diagnostics", "Blood Bank"] },
          { key: "clinicalEstablishmentLicense", label: "Clinical Establishment License (Mandatory)", type: "image_upload", mandatory: true },
          { key: "pcpndtCertificate", label: "PCPNDT Certificate for Scans (Mandatory)", type: "image_upload", mandatory: true, showIf: { field: "labType", contains: ["Radiology & Imaging", "Integrated Diagnostics"] } },
          { key: "facadeImage", label: "Facility / Reception Photo", type: "image_upload" },
          { key: "accreditations", label: "Accreditations", type: "string_array", placeholder: "e.g. NABL, NABH, ISO" },
          { key: "homeCollection", label: "Home Sample Collection", type: "boolean", mandatory: true, showIf: { field: "labType", contains: ["Pathology", "Integrated Diagnostics"] } },
          { key: "is247", label: "Open 24/7", type: "boolean" },
          { key: "timings", label: "Timings", type: "text", mandatory: true, placeholder: "e.g. Mon-Sat 8AM - 9PM" },
          {
            key: "machinery",
            label: "Heavy Machinery & Equipment",
            type: "object_array",
            showIf: { field: "labType", contains: ["Radiology & Imaging", "Integrated Diagnostics"] },
            arrayFields: [
              { key: "machineName", label: "Machine Name (e.g. 3 Tesla MRI)", type: "text" },
              { key: "manufacturer", label: "Manufacturer / Model (e.g. Siemens Magnetom)", type: "text" },
              { key: "machineImage", label: "Machine Photo", type: "image_upload" }
            ]
          }
        ]
      },
      {
        id: "test_menu",
        label: "Diagnostic Test Menu",
        fields: [
          {
            key: "tests",
            label: "Available Tests & Scans",
            type: "hybrid_test_array"
          }
        ]
      },
      {
        id: "departments",
        label: "Departments & Roster",
        fields: [
          {
            key: "departments",
            label: "Departments",
            type: "object_array",
            arrayFields: [
              { key: "name", label: "Department Name (e.g. Pathology)", type: "text" },
              { key: "head", label: "Head Pathologist / Radiologist", type: "text" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "departmentImage", label: "Department Photo", type: "image_upload" },
              {
                key: "roster",
                label: "Department Doctors",
                type: "hybrid_entity_selector",
                targetEntity: "Doctor",
                placeholder: "Search verified doctors to add to lab roster..."
              }
            ]
          }
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
          { key: "ambulanceType", label: "Ambulance Type", type: "string_array", mandatory: true, placeholder: "Select Ambulance Types", options: ["Basic Life Support (BLS)", "Advanced Life Support (ALS)", "Patient Transport Vehicle", "Mortuary Van"] },
          { key: "fleetSize", label: "Fleet Size", type: "number", mandatory: true, placeholder: "e.g. 5" },
          { key: "oxygenAvailable", label: "Oxygen Available", type: "boolean", showIf: { field: "ambulanceType", contains: ["Basic Life Support (BLS)", "Advanced Life Support (ALS)"] } },
          { key: "ventilatorAvailable", label: "Ventilator Available", type: "boolean", showIf: { field: "ambulanceType", contains: ["Advanced Life Support (ALS)"] } },
          { key: "is247", label: "Available 24/7", type: "boolean" },
          { key: "baseLocation", label: "Base Location / Station", type: "text", mandatory: true }
        ]
      }
    ]
  }
};
