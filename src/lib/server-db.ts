const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sd-auth-center";
const REST_BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * Server-Side bypass of Firebase Client SDK to prevent Vercel Node freezing.
 * Fetches all verified directory items (doctors, hospitals, labs, etc.)
 */
export async function getAllApprovedDirectoryItems(): Promise<any[]> {
  try {
    const res = await fetch(`${REST_BASE_URL}/directory?pageSize=1000`, { 
      next: { revalidate: 3600 } 
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch directory from REST API: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    if (!data.documents) return [];

    return data.documents.map((doc: any) => {
      const fields = doc.fields || {};
      const id = doc.name.split('/').pop();
      
      const getString = (key: string) => fields[key]?.stringValue || "";
      const getBoolean = (key: string) => fields[key]?.booleanValue || false;
      const getNumber = (key: string) => fields[key]?.integerValue ? Number(fields[key].integerValue) : (fields[key]?.doubleValue || 0);

      const getNestedString = (mapField: string, key: string) => fields[mapField]?.mapValue?.fields?.[key]?.stringValue || "";
      const getArray = (key: string) => fields[key]?.arrayValue?.values?.map((v:any) => v.stringValue) || [];

      const adminLocked = getBoolean("adminLocked");
      if (adminLocked) return null; // Filter locked out completely

      const name = getString("name") || getString("legalName") || getNestedString("basicInfo", "fullName") || getString("firstName") || "Unknown Entity";
      const subtitle = getString("subCategory") || getString("specialty") || getString("category") || getNestedString("basicInfo", "specialityName") || "Service Provider";
      const city = getString("city") || getString("district") || "Unknown";
      const state = getString("state") || "Odisha";
      const country = getString("country") || "India";

      const tags = getArray("tags").join(' ');
      const services = getArray("services").join(' ');
      const about = getString("about") || getString("description") || "";
      const category = getString("category");

      const searchableString = `${name} ${subtitle} ${city} ${state} ${country} ${tags} ${services} ${about} ${category}`.toLowerCase();

      return {
        id,
        type: category ? category.toLowerCase() : 'unknown',
        name,
        subtitle,
        location: `${city}, ${state}`,
        rating: getNumber("rating"),
        verified: getBoolean("verified"),
        country,
        state,
        district: city, // treat city as district
        searchableString,
        profileImage: getString("profileImage") || getString("logoUrl") || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
        experience: getString("experience"),
        category // needed for sitemap filtering
      };
    }).filter(Boolean);

  } catch (error) {
    console.error("Error fetching directory items via REST:", error);
    return [];
  }
}
