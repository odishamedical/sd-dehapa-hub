import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsapp.service';
import { BotService } from '@/services/bot.service';

export async function POST(req: NextRequest) {
  try {
    const { to, text } = await req.json();

    if (!to || !text) {
      return NextResponse.json({ error: 'Missing to or text' }, { status: 400 });
    }

    const response = await WhatsAppService.sendTextMessage(to, text);
    if (response?.error) {
      return NextResponse.json({ error: 'WhatsApp API Error', details: response.data }, { status: 500 });
    }

    // Log the message as admin
    await BotService.logMessage(to, 'admin', text);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
