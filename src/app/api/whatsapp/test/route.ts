import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsapp.service';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const to = searchParams.get('to');

  if (!to) {
    return NextResponse.json({ error: "Missing 'to' parameter" }, { status: 400 });
  }

  try {
    const result = await WhatsAppService.sendInteractiveButtons(to, "Test Interactive Message", [
      { id: 'btn_test', title: 'Test Button' }
    ]);
    return NextResponse.json({ 
      success: true, 
      metaResponse: result,
      env: {
        hasToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
        hasPhoneId: !!process.env.WHATSAPP_PHONE_NUMBER_ID
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
