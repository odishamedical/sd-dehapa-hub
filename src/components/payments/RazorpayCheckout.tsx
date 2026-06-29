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

  const handlePayment = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setLoading(true);

    // BYPASS PAYMENT FOR TESTING:
    // We immediately simulate a successful payment after a short delay
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        razorpay_payment_id: "mock_payment_id_12345",
        razorpay_order_id: "mock_order_id_12345",
        razorpay_signature: "mock_signature_12345"
      });
    }, 800);
    
    // Original Razorpay logic is completely bypassed below.
    return;
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
