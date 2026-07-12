import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('query');
    
    if (!query) {
      return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Places API key is not configured' }, { status: 500 });
    }

    // Call Google Places Text Search API
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API Error:', data);
      return NextResponse.json({ error: 'Failed to fetch from Google Places' }, { status: 500 });
    }

    // We need phone numbers, but Text Search doesn't always return them.
    // However, to keep it fast, we will grab the place_id for each result 
    // and then fetch the details (specifically the formatted_phone_number).
    const results = data.results || [];
    
    // To avoid hitting API limits too hard, we only process the first 10 results for phone numbers
    const topResults = results.slice(0, 10);
    
    const leads = await Promise.all(
      topResults.map(async (place: any) => {
        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,formatted_address&key=${apiKey}`;
          const detailsRes = await fetch(detailsUrl);
          const detailsData = await detailsRes.json();
          
          return {
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            phone: detailsData.result?.formatted_phone_number || null,
            rating: place.rating,
          };
        } catch (e) {
          return {
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            phone: null,
            rating: place.rating,
          };
        }
      })
    );

    // Filter out leads without phone numbers since we can't WhatsApp them
    const validLeads = leads.filter(lead => lead.phone !== null);

    return NextResponse.json({ leads: validLeads });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
