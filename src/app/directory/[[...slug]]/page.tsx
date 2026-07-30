import React from "react";
import { Metadata } from "next";
import ClientDirectory from "./ClientDirectory";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  
  // New Geo-Taxonomy Mapping: [country]/[state]/[district]/[category]
  const country = slug[0] ? decodeURIComponent(slug[0]) : "global";
  const state = slug[1] ? decodeURIComponent(slug[1]) : "";
  const district = slug[2] ? decodeURIComponent(slug[2]) : "";
  const category = slug[3] ? decodeURIComponent(slug[3]) : "";

  let title = "Verified Healthcare Providers Directory | Dehapa";
  let description = "Discover Top-Rated Doctors, Hospitals, Pharmacies, and Urgent Care worldwide.";

  const formatCategory = (cat: string) => {
    if (cat.toLowerCase() === 'doctor') return 'Doctors';
    if (cat.toLowerCase() === 'hospital') return 'Hospitals';
    if (cat.toLowerCase() === 'pharmacy') return 'Pharmacies';
    if (cat.toLowerCase() === 'lab') return 'Diagnostic Labs';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const categoryName = category ? formatCategory(category) : 'Healthcare Providers';

  if (country !== "global") {
    title = `Verified ${categoryName} in ${country}`;
    if (district) {
      title = `Best ${categoryName} in ${district}, ${state} | Dehapa Hub`;
      description = `Find the top-rated, verified ${categoryName.toLowerCase()} and specialists in ${district}, ${state}. Trusted healthcare directories.`;
    } else if (state) {
      title = `Top ${categoryName} in ${state}, ${country} | Dehapa Hub`;
    }
  }

  return {
    title,
    description,
    openGraph: { 
      title, 
      description,
      images: ["https://sd-dehapa-hub.vercel.app/home-hero.png"]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://sd-dehapa-hub.vercel.app/home-hero.png"]
    }
  };
}

export const dynamic = 'force-dynamic';

export default async function DirectoryServerPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];

  const country = slug[0] ? decodeURIComponent(slug[0]) : "global";
  const state = slug[1] ? decodeURIComponent(slug[1]) : "";
  const district = slug[2] ? decodeURIComponent(slug[2]) : "";
  const category = slug[3] ? decodeURIComponent(slug[3]) : "";

  return (
    <main>
      <ClientDirectory 
        initialCountry={country} 
        initialState={state} 
        initialDistrict={district} 
        initialCategory={category} 
      />
    </main>
  );
}
