// src/lib/ticketConfig.ts
export type TicketConfigEntry = {
  subtitleField: string;
  trustMarker: string;
  leftMetric: (entity: any) => string;
  rightMetric: (entity: any) => string;
  cta: {
    label: string;
    bgColor: string; // Tailwind bg color class without prefix, e.g., 'teal-600'
    textColor: string; // Tailwind text color class
  };
};

export const TicketConfig: Record<string, TicketConfigEntry> = {
  pharmacy: {
    subtitleField: 'subCategory',
    trustMarker: 'Verified Pharmacy',
    leftMetric: (e) => e.deliveryStatus || 'Home Delivery Available',
    rightMetric: (e) => e.discountOffer || 'Retail Pricing',
    cta: { label: 'ORDER MEDICINE', bgColor: 'teal-600', textColor: 'white' },
  },
  hospital: {
    subtitleField: 'subCategory',
    trustMarker: 'Verified Institution',
    leftMetric: (e) => e.scale || `${e.beds ?? '100+'} Beds`,
    rightMetric: (e) => e.emergencyReadiness || '24/7 Casualty & ICU',
    cta: { label: 'VIEW HOSPITAL', bgColor: 'teal-600', textColor: 'white' },
  },
  lab: {
    subtitleField: 'subCategory',
    trustMarker: 'Verified Lab',
    leftMetric: (e) => e.homeCollection || 'Free Sample Pickup',
    rightMetric: (e) => e.reportingSpeed || '24‑Hour Digital Reports',
    cta: { label: 'BOOK TEST', bgColor: 'teal-600', textColor: 'white' },
  },
  ambulance: {
    subtitleField: 'subCategory',
    trustMarker: 'Verified Fleet',
    leftMetric: (e) => e.responseTime || '15‑Min Avg Response',
    rightMetric: (e) => e.supportLevel || 'BLS & Oxygen on Board',
    cta: { label: 'CALL EMERGENCY', bgColor: 'red-600', textColor: 'white' },
  },
  doctor: {
    subtitleField: 'subCategory',
    trustMarker: 'Verified Experience',
    leftMetric: (e) => e.fee || 'Contact Doctor',
    rightMetric: (e) => '',
    cta: { label: 'Book Appointment', bgColor: 'teal-600', textColor: 'white' },
  },
};
