'use client';

import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

interface RazorpayCheckoutProps {
  amount: number; // Amount in INR (e.g., 100 for Rs 100)
  buttonText: string;
  paymentType: string;
  onSuccess: (paymentDetails: any) => void;
  className?: string;
}

export default function RazorpayCheckout({ amount, buttonText, paymentType, onSuccess, className }: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      // Step 1: Create an Order on our backend
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type: paymentType }),
      });
      const order = await orderResponse.json();

      if (order.error) {
        alert('Failed to initialize checkout. Please try again.');
        setLoading(false);
        return;
      }

      // Step 2: Configure Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Dehapa Ecosystem',
        description: paymentType === 'DOCTOR_SUBSCRIPTION' ? 'Premium Profile Upgrade' : 'Platform Booking Fee',
        image: '/logo.png', // Logo shown on the Razorpay popup
        order_id: order.id,
        handler: async function (response: any) {
          // Step 3: Verify the payment signature on our backend
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const verifyResult = await verifyResponse.json();
          
          if (verifyResult.verified) {
            onSuccess(response);
          } else {
            alert('Payment verification failed!');
          }
        },
        prefill: {
          name: 'John Doe',
          email: 'user@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#0d9488', // Dehapa Teal theme color
        },
      };

      // @ts-ignore
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (error) {
      console.error('Payment Flow Error:', error);
      alert('Something went wrong initiating the payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`relative overflow-hidden group ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-90 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative flex items-center justify-center gap-2 text-white font-bold tracking-wide">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5" />
        )}
        {loading ? 'INITIALIZING...' : buttonText}
      </div>
    </button>
  );
}
