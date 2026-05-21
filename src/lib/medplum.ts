import { MedplumClient } from '@medplum/core';

// Using Medplum public sandbox for development
// In production, we would use process.env.NEXT_PUBLIC_MEDPLUM_PROJECT_ID
export const medplum = new MedplumClient({
  baseUrl: 'https://api.medplum.com/',
});
