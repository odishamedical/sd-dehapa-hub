import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET as string;

    // Generate the expected signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    // Compare the signatures
    if (generated_signature === razorpay_signature) {
      // Payment is authentic!
      // Here we will eventually update Firebase to mark the order as successful
      
      return NextResponse.json(
        { message: 'Payment verified successfully', verified: true },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid payment signature', verified: false },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json(
      { error: 'Verification failed', details: error.message },
      { status: 500 }
    );
  }
}
