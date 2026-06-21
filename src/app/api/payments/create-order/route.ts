import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, type } = body;

    // Initialize Razorpay SDK
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    // Create order options
    const options = {
      amount: amount * 100, // Razorpay works in paise (Rs 1 = 100 paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        paymentType: type, // e.g., 'PATIENT_BOOKING_FEE', 'DOCTOR_SUBSCRIPTION_MONTHLY'
      },
    };

    // Call Razorpay API to generate the Order ID
    const order = await razorpay.orders.create(options);

    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    console.error('Razorpay Error:', error);
    return NextResponse.json(
      { error: 'Failed to create Razorpay order', details: error.message },
      { status: 500 }
    );
  }
}
