"use client";

import { MedplumProvider } from '@medplum/react';
import { medplum } from '../lib/medplum';

export default function MedplumProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MedplumProvider medplum={medplum}>
      {children}
    </MedplumProvider>
  );
}
