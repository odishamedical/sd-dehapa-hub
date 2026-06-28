import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 });
    }

    const DAILY_API_KEY = process.env.DAILY_API_KEY || "ba8b40d2645b0fd54546c8f3d3845b8ff8fb0c2bb0c250bc008251af2df14b49";

    // Daily API endpoint for creating rooms
    const url = 'https://api.daily.co/v1/rooms';

    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: `dehapa-${appointmentId}`,
        properties: {
          enable_chat: false,
          enable_screenshare: false,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Expire in 24 hours
        },
      }),
    };

    const response = await fetch(url, options);
    const room = await response.json();

    // If the room already exists (e.g. from a previous click), Daily returns an error.
    // In that case, we MUST fetch the existing room to get the exact correct domain.
    if (room.error) {
       if (room.error === 'invalid-request-error' && room.info === 'a room with that name already exists') {
          const existingRes = await fetch(`https://api.daily.co/v1/rooms/dehapa-${appointmentId}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${DAILY_API_KEY}` }
          });
          const existingRoom = await existingRes.json();
          if (existingRoom.url) {
             return NextResponse.json({ url: existingRoom.url });
          }
       }
       throw new Error(room.error || 'Failed to create room');
    }

    return NextResponse.json({ url: room.url });
  } catch (error: any) {
    console.error('Error creating Daily room:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
