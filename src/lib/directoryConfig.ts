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
          { key: "establishedYear", label: "Established Year", type: "text", placeholder: "e.g. 1995" },
          { key: "ownershipType", label: "Ownership Type", type: "select", options: ["Private Hospital", "Government Hospital", "Trust / NGO", "Corporate"] },
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
        label: "Accreditations & Insurance",
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
      },
      {
        id: "network_setup",
        label: "Establish Your Network Connection",
        fields: [
          {
            key: "partnerLabs",
            label: "Partner Diagnostic Labs (Outsourced Tests)",
            type: "string_array",
            placeholder: "Type lab name and press enter..."
          },
          {
            key: "partnerPharmacies",
            label: "Recommended / Partner Pharmacies",
            type: "string_array",
            placeholder: "Type pharmacy name and press enter..."
          }
        ]
      }
    ]
  },
  Pharmacy: {
    name: "Pharmacy",
    tabs: [
      {
        id: "pharmacy_identity",
        label: "Pharmacy Profile & Identity",
        fields: [
          { key: "pharmacyType", label: "Primary Pharmacy Identity", type: "select", mandatory: true, options: ["Retail Store", "Wholesaler", "Company Distributor / Franchise", "Pharma Manufacturer"] },
          { key: "facadeImage", label: "Storefront / Facility Photo", type: "image_upload" },
          
          { key: "retailLicense", label: "Retail Drug License No. (Mandatory)", type: "text", mandatory: true, showIf: { field: "pharmacyType", contains: ["Retail Store"] } },
          { key: "pharmacistName", label: "Registered Pharmacist Name", type: "text", showIf: { field: "pharmacyType", contains: ["Retail Store"] } },
          
          { key: "wholesaleLicense", label: "Wholesale Drug License No. (Mandatory)", type: "text", mandatory: true, showIf: { field: "pharmacyType", contains: ["Wholesaler"] } },
          
          { key: "cfaLicense", label: "CFA / Distributor License No. (Mandatory)", type: "text", mandatory: true, showIf: { field: "pharmacyType", contains: ["Company Distributor / Franchise"] } },
          
          { key: "manufacturingLicense", label: "Manufacturing License No. (Mandatory)", type: "text", mandatory: true, showIf: { field: "pharmacyType", contains: ["Pharma Manufacturer"] } }
        ]
      },
      {
        id: "operations",
        label: "Operations & Services",
        fields: [
          // Retail Store Operations
          { key: "routineTiming", label: "Store Timing / Routine", type: "text", placeholder: "e.g. 9 AM - 10 PM", showIf: { field: "pharmacyType", contains: ["Retail Store"] } },
          { key: "is247", label: "Open 24/7", type: "boolean", showIf: { field: "pharmacyType", contains: ["Retail Store"] } },
          { key: "facilities", label: "Available Facilities", type: "string_array", options: ["Cold Chain Storage", "Home Collection", "Consultation Room"], showIf: { field: "pharmacyType", contains: ["Retail Store"] } },
          { key: "homeDelivery", label: "Door Delivery Available", type: "boolean", showIf: { field: "pharmacyType", contains: ["Retail Store"] } },
          { key: "deliveryCoverage", label: "Delivery Coverage Area", type: "text", placeholder: "e.g. Cuttack City, 5km radius", showIf: { field: "pharmacyType", contains: ["Retail Store"] } },
          {
            key: "retailerSuppliers",
            label: "My Wholesalers / Suppliers (Optional)",
            type: "object_array",
            showIf: { field: "pharmacyType", contains: ["Retail Store"] },
            arrayFields: [
              { key: "wholesalerName", label: "Wholesaler Name", type: "text" },
              { key: "location", label: "Place / Location", type: "text" }
            ]
          },

          // Wholesaler Operations
          { key: "wholesalerArea", label: "Routes / Areas Covered", type: "text", placeholder: "e.g. Cuttack, Bhubaneswar route", showIf: { field: "pharmacyType", contains: ["Wholesaler"] } },
          {
            key: "wholesalerCompanies",
            label: "Companies Represented (Mandatory for Publicity)",
            type: "object_array",
            mandatory: true,
            showIf: { field: "pharmacyType", contains: ["Wholesaler"] },
            arrayFields: [
              { key: "companyName", label: "Company Name", type: "text" }
            ]
          },
          {
            key: "wholesalerRetailers",
            label: "Retailers Served (Optional)",
            type: "object_array",
            showIf: { field: "pharmacyType", contains: ["Wholesaler"] },
            arrayFields: [
              { key: "retailerName", label: "Retailer Name", type: "text" },
              { key: "location", label: "Place / Location", type: "text" }
            ]
          },
          
          // Distributor Operations
          { key: "distributorArea", label: "Area Covered (State, District)", type: "text", placeholder: "e.g. Odisha State, Khordha District", showIf: { field: "pharmacyType", contains: ["Company Distributor / Franchise"] } },
          {
            key: "distributorCompanies",
            label: "Companies Represented (Mandatory for Publicity)",
            type: "object_array",
            mandatory: true,
            showIf: { field: "pharmacyType", contains: ["Company Distributor / Franchise"] },
            arrayFields: [
              { key: "companyName", label: "Company Name", type: "text" }
            ]
          },
          
          // Manufacturer Operations
          { key: "productsManufactured", label: "Products & Composition", type: "object_array", showIf: { field: "pharmacyType", contains: ["Pharma Manufacturer"] }, arrayFields: [
            { key: "productName", label: "Product Name", type: "text" },
            { key: "composition", label: "Chemical Composition", type: "text" }
          ] },
          {
            key: "manufacturerNetwork",
            label: "My Distribution Network (C&F, Distributors)",
            type: "object_array",
            mandatory: true,
            showIf: { field: "pharmacyType", contains: ["Pharma Manufacturer"] },
            arrayFields: [
              { key: "distributorName", label: "Distributor / C&F Name", type: "text" },
              { key: "areaOfOperation", label: "Place / Area of Operation", type: "text" }
            ]
          }
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
      },
      {
        id: "network_setup",
        label: "Establish Your Network Connection",
        fields: [
          {
            key: "affiliatedHospitals",
            label: "Affiliated Hospitals (Incoming Samples)",
            type: "string_array",
            placeholder: "Type hospital name and press enter..."
          },
          {
            key: "collectionCenters",
            label: "Authorized Collection Centers / Franchises",
            type: "string_array",
            placeholder: "Type center name and press enter..."
          }
        ]
      }
    ]
  },
  Ambulance: {
    name: "Ambulance",
    tabs: [
      {
        id: "ambulance_identity",
        label: "Agency Identity & Operations",
        fields: [
          { key: "registrationNumber", label: "Agency Registration No.", type: "text", mandatory: true },
          { key: "establishedYear", label: "Established Year", type: "text" },
          { key: "coverageRadius", label: "Coverage Radius", type: "text", placeholder: "e.g., 50km from base" },
          { key: "is247", label: "Available 24/7", type: "boolean" },
          { key: "baseLocation", label: "Base Location / Station", type: "text", mandatory: true }
        ]
      },
      {
        id: "fleet_registration",
        label: "Fleet Registration & Drivers",
        fields: [
          { key: "fleetSize", label: "Total Fleet Size", type: "number", mandatory: true, placeholder: "e.g. 5" },
          {
            key: "driverMapping",
            label: "Driver Mapping List",
            type: "object_array",
            arrayFields: [
              { key: "registrationNumber", label: "Ambulance Registration Number", type: "text", placeholder: "e.g., OD-02-1234" },
              { key: "driverName", label: "Assigned Driver Name", type: "text" },
              { key: "driverEmail", label: "Driver Gmail", type: "text" },
              { key: "driverPhone", label: "Driver Phone", type: "text" },
              { key: "driverWhatsApp", label: "Driver WhatsApp Number", type: "text" }
            ]
          }
        ]
      },
      {
        id: "vehicle_profiles",
        label: "Vehicle Profiles",
        fields: [
          {
            key: "vehicles",
            label: "Detailed Vehicle Roster",
            type: "object_array",
            arrayFields: [
              { key: "registrationNumber", label: "Vehicle Number Plate", type: "text", placeholder: "Must match mapping above" },
              { key: "classification", label: "Vehicle Classification", type: "text", placeholder: "AC / Non-AC" },
              { key: "lifeSupportLevel", label: "Life Support Level", type: "text", placeholder: "BLS / ALS / Patient Transport" },
              { key: "medicalEquipment", label: "Medical Equipment", type: "string_array", placeholder: "e.g., Oxygen, Ventilator, Defibrillator" },
              { key: "attendantSeats", label: "Attendant Seats", type: "number", placeholder: "e.g., 2" },
              { key: "baseFare", label: "Base Fare (₹)", type: "number", placeholder: "e.g., 500" },
              { key: "perKmRate", label: "Per Km Rate (₹)", type: "number", placeholder: "e.g., 50" },
              { key: "outsideImage", label: "Outside Ambulance Image", type: "image_upload" },
              { key: "insideImage", label: "Inner Side Ambulance Image", type: "image_upload" },
              { key: "oxygenImage", label: "Oxygen Setup Image", type: "image_upload" },
              { key: "lifeSupportImage", label: "Life Support Setup Image", type: "image_upload" }
            ]
          }
        ]
      },
      {
        id: "network_setup",
        label: "Establish Your Network Connection",
        fields: [
          {
            key: "partnerHospitals",
            label: "Partner / Associated Hospitals",
            type: "string_array",
            placeholder: "Type hospital name and press enter..."
          },
          {
            key: "partnerClinics",
            label: "Partner Clinics",
            type: "string_array",
            placeholder: "Type clinic name and press enter..."
          },
          {
            key: "corporateTieUps",
            label: "Corporate / Industrial Tie-ups",
            type: "string_array",
            placeholder: "Type corporate client name and press enter..."
          }
        ]
      }
    ]
  }
};
