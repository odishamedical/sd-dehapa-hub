import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsapp.service';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { phone, businessName } = await req.json();

    if (!phone || !businessName) {
      return NextResponse.json({ error: 'Missing phone or businessName' }, { status: 400 });
    }

    // Clean phone number (remove spaces, dashes, ensure country code)
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Add 91 if it's an Indian 10-digit number
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    // Prevent spamming the same business
    const outreachDoc = await getDoc(doc(db, 'outreach_leads', cleanPhone));
    if (outreachDoc.exists()) {
      return NextResponse.json({ error: 'Already reached out to this number' }, { status: 400 });
    }

    // Call WhatsApp API using the template the user just configured
    // Note: The template name in the screenshot was 'claim_your_dehapa_profile'
    const result = await WhatsAppService.sendTemplateMessage(
      cleanPhone,
      'claim_your_dehapa_profile',
      'en_US',
      [businessName], // Body variables (Hi {{1}})
      cleanPhone // Button URL variable (https://www.dehapa.com/claim?phone={{1}})
    );

    if (result && !result.error) {
      // Log success in Firebase so we don't message them again
      await setDoc(doc(db, 'outreach_leads', cleanPhone), {
        businessName,
        phone: cleanPhone,
        status: 'invited',
        sentAt: new Date().toISOString()
      });
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to send WhatsApp message', details: result }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Outreach error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
