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
    const { state, district, locality, pin, category, subCategory, query } = body;

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
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.photos'
      },
      body: JSON.stringify({
        textQuery: finalQuery,
        pageSize: 10 // Max 20 allowed per page, let's keep it tight for the staging grid
      })
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
      return NextResponse.json({ results: [] });
    }

    // Transform into our StagedListing format
    const results = data.places.map((place: any) => {
      const name = place.displayName?.text || 'Unknown Name';
      const phone = place.nationalPhoneNumber || '';
      
      let imageUrl = '';
      if (place.photos && place.photos.length > 0) {
        // Construct media url for the first photo
        imageUrl = `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=400&maxWidthPx=400&key=${GOOGLE_PLACES_API_KEY}`;
      } else {
        // Fallback UI avatar
        imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f766e&color=fff&size=150`;
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
        hasWarning: !phone // Flag if phone is missing so Admin knows
      };
    });

    return NextResponse.json({ results, query: finalQuery });

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
