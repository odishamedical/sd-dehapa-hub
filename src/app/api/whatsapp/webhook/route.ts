import { NextRequest, NextResponse } from 'next/server';
import { BotService } from '@/services/bot.service';

// This is the token you will enter in the Meta Developer Dashboard
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'DEHAPA_WHATSAPP_SECRET_2026';

// GET request is used by Meta for Webhook Verification
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Check if a request is for verification
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      // Respond with the challenge token from the request
      return new NextResponse(challenge, { status: 200 });
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return new NextResponse('Bad Request', { status: 400 });
}

// POST request is used by Meta to send actual WhatsApp messages/events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if this is an event from a WhatsApp API
    if (body.object === 'whatsapp_business_account') {
      
      // Process each entry (there may be multiple if batched)
      for (const entry of body.entry) {
        // Process each change in the entry
        for (const change of entry.changes) {
          // Check if it's a message event
          if (change.value && change.value.messages) {
            const phone_number_id = change.value.metadata.phone_number_id;
            const from = change.value.messages[0].from; // The user's phone number
            const msg_body = change.value.messages[0].text?.body; // The message text

            console.log(`Received message from ${from}: ${change.value.messages[0].type}`);
            
            // Await the message handling to ensure Vercel doesn't kill the serverless function before it finishes
            try {
              await BotService.handleIncomingMessage(from, change.value.messages[0]);
            } catch (err) {
              console.error("Bot Service Error:", err);
            }
          }
        }
      }

      // Return a '200 OK' response to all requests
      return NextResponse.json({ status: 'success' }, { status: 200 });
    } else {
      // Return a '404 Not Found' if event is not from a WhatsApp API
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
