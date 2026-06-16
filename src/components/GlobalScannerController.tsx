"use client";

import React, { useState, useEffect } from 'react';
import ScannerModal from './ScannerModal';
import MobileStickyFooter from './MobileStickyFooter';

export default function GlobalScannerController() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    // Check initial hash
    if (window.location.hash === '#scan') {
      setIsScannerOpen(true);
    }

    // Listen to hash changes
    const handleHashChange = () => {
      if (window.location.hash === '#scan') {
        setIsScannerOpen(true);
      } else {
        setIsScannerOpen(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const closeScanner = () => {
    setIsScannerOpen(false);
    if (window.location.hash === '#scan') {
      window.history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  };

  const openScanner = () => {
    setIsScannerOpen(true);
    if (window.location.hash !== '#scan') {
      window.location.hash = 'scan';
    }
  };

  return (
    <>
      {isScannerOpen && <ScannerModal onClose={closeScanner} />}
      <MobileStickyFooter onScanClick={openScanner} />
    </>
  );
}
