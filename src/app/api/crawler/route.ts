import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: 'Google Places API Key is not configured in the backend.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { state, district, locality, city, pin, category, subCategory, query, pageToken } = body;

    // Construct the text search query
    const searchTerms = [];
    if (query) {
      searchTerms.push(query);
    } else {
      if (customCategory(subCategory)) searchTerms.push(subCategory);
      else if (category) searchTerms.push(category);
    }

    const locationTerms = [];
    if (locality) locationTerms.push(locality);
    if (city) locationTerms.push(city);
    if (district && district !== 'Other') locationTerms.push(district);
    if (state) locationTerms.push(state);
    if (pin) locationTerms.push(pin);

    const finalQuery = `${searchTerms.join(' ')} in ${locationTerms.join(', ')}`.trim();

    if (!finalQuery) {
      return NextResponse.json(
        { error: 'Insufficient parameters to build a search query.' },
        { status: 400 }
      );
    }

    // Call Google Places API (New)
    const requestBody: any = {
      textQuery: finalQuery,
      pageSize: 20
    };
    if (pageToken) {
      requestBody.pageToken = pageToken;
    }

    // 1. Dynamic Field Masking based on Category
    let fieldMask = 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.photos,nextPageToken';
    
    if (category === "Doctor") {
      fieldMask += ',places.regularOpeningHours,places.editorialSummary,places.googleMapsUri,places.types,places.businessStatus';
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': fieldMask
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Google API Error:", errText);
      return NextResponse.json(
        { error: `Google API returned an error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.places) {
      return NextResponse.json({ results: [], nextPageToken: null });
    }

    let placesToMap = data.places;

    // 1.5 Strict Filtering for Doctors
    // We filter out results that Google mistakenly thought were doctors (like Hospitals or Medical Stores)
    if (category === "Doctor") {
      placesToMap = data.places.filter((place: any) => {
        if (!place.types) return true; 
        
        // Exclude massive hospitals, pharmacies, and general stores
        const excludeTypes = ['hospital', 'pharmacy', 'drugstore', 'store', 'shopping_mall', 'veterinary_care'];
        const isExcluded = place.types.some((t: string) => excludeTypes.includes(t));
        
        // Only keep if it's NOT a hospital/pharmacy
        return !isExcluded;
      });
    }

    // 2. Transform into our StagedListing format dynamically
    const results = placesToMap.map((place: any) => {
      const name = place.displayName?.text || 'Unknown Name';
      const phone = place.nationalPhoneNumber || '';
      
      let imageUrl = '';
      let rawImages: string[] = [];
      
      if (place.photos && place.photos.length > 0) {
        // Construct media url for the first photo as the default thumbnail
        imageUrl = `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=400&maxWidthPx=400&key=${GOOGLE_PLACES_API_KEY}`;
        
        // Extract up to 10 photos for the rawImages array (high res for cropping)
        rawImages = place.photos.slice(0, 10).map((p: any) => 
          `https://places.googleapis.com/v1/${p.name}/media?maxHeightPx=1200&maxWidthPx=1200&key=${GOOGLE_PLACES_API_KEY}`
        );
      } else {
        // Fallback UI avatar
        imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f766e&color=fff&size=150`;
      }

      // 3. Extract Category-Specific Fields
      let hours: any[] = [];
      let about = '';
      let mapUrl = '';
      let specialties: string[] = [];

      if (category === "Doctor") {
        if (place.regularOpeningHours && place.regularOpeningHours.weekdayDescriptions) {
          hours = place.regularOpeningHours.weekdayDescriptions.map((desc: string) => {
            const [day, ...timeParts] = desc.split(': ');
            return { day, time: timeParts.join(': ') || 'Closed' };
          });
        }
        if (place.editorialSummary && place.editorialSummary.text) {
          about = place.editorialSummary.text;
        }
        if (place.googleMapsUri) {
          mapUrl = place.googleMapsUri;
        }
        if (place.types) {
          specialties = place.types
            .filter((t: string) => !['point_of_interest', 'establishment', 'health'].includes(t))
            .map((t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()));
        }
      }

      return {
        id: place.id,
        name: name,
        address: place.formattedAddress || 'No Address Provided',
        phone: phone,
        rating: place.rating || 0,
        reviews: place.userRatingCount || 0,
        website: place.websiteUri || '',
        image: imageUrl,
        rawImages: rawImages,
        hasWarning: !phone, // Flag if phone is missing so Admin knows
        
        // Inject Dynamic Doctor Fields
        ...(category === "Doctor" && {
          hours: hours.length > 0 ? hours : undefined,
          about: about || undefined,
          clinicMapUrl: mapUrl || undefined,
          specialties: specialties.length > 0 ? specialties : undefined,
          businessStatus: place.businessStatus || undefined
        })
      };
    });

    return NextResponse.json({ results, query: finalQuery, nextPageToken: data.nextPageToken || null });

  } catch (error: any) {
    console.error("Crawler Error:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred while crawling.' },
      { status: 500 }
    );
  }
}

function customCategory(sub: string) {
  if (!sub) return false;
  if (sub === 'Other') return false;
  return true;
}
