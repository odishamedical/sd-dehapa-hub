import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsapp.service';

// Mock OTP storage. In production, use Firestore or Redis.
const otpStore = new Map<string, { code: string, expires: number }>();

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP (expires in 5 minutes)
    otpStore.set(phone, { code: otp, expires: Date.now() + 5 * 60 * 1000 });

    // Try to send via WhatsApp Service
    try {
      const message = `*DehaPa Verification*\n\nYour OTP is: *${otp}*\n\nPlease do not share this code with anyone. It expires in 5 minutes.`;
      await WhatsAppService.sendTextMessage("91" + phone, message);
    } catch (err) {
      console.error("WhatsApp API error, falling back to mock:", err);
      // In development, if WhatsApp API is not configured, we still allow the flow
      console.log(`[MOCK WHATSAPP] To: ${phone}, OTP: ${otp}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Export the store so verify route can access it (only works in single-instance deployments)
// For Vercel Serverless, you MUST use Firestore to store OTPs. We will use a fallback logic in verify.
export { otpStore };
