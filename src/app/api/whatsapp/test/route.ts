import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsapp.service';
import { BotService } from '@/services/bot.service';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const to = searchParams.get('to');

  if (to === 'debug') {
    try {
      const q = query(collection(db, 'whatsapp_debug_logs'), limit(10));
      const docs = await getDocs(q);
      const logs: any[] = [];
      docs.forEach(d => logs.push({ id: d.id, data: d.data() }));
      
      return NextResponse.json({ success: true, logs });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

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
