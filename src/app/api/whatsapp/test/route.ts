import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsapp.service';
import { BotService } from '@/services/bot.service';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const to = searchParams.get('to');

  if (!to) {
    return NextResponse.json({ error: "Missing 'to' parameter" }, { status: 400 });
  }

  try {
    // Simulate user clicking 'btn_doctors'
    await BotService.handleIncomingMessage(to, {
      from: to,
      type: "interactive",
      interactive: {
        type: "button_reply",
        button_reply: {
          id: "btn_doctors",
          title: "Find a Doctor"
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Simulated btn_doctors click!"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
