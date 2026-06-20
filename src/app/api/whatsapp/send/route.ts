import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsapp.service';
import { BotService } from '@/services/bot.service';

export async function POST(req: NextRequest) {
  try {
    const { to, text, messageType, templateName, parameters } = await req.json();

    if (!to || (!text && !templateName)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let response;
    if (messageType === 'template' && templateName) {
      response = await WhatsAppService.sendTemplateMessage(to, templateName, 'en_US', parameters);
      await BotService.logMessage(to, 'admin', `[TEMPLATE: ${templateName}]`);
    } else {
      response = await WhatsAppService.sendTextMessage(to, text);
      await BotService.logMessage(to, 'admin', text);
    }

    if (response?.error) {
      return NextResponse.json({ error: 'WhatsApp API Error', details: response.data }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
