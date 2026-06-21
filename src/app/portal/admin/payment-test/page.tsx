'use client';

import { useState } from 'react';
import { ShieldCheck, CalendarCheck, CheckCircle2 } from 'lucide-react';
import RazorpayCheckout from '@/components/payments/RazorpayCheckout';

export default function PaymentTestPage() {
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  const handleSuccess = (type: string, response: any) => {
    console.log('Payment Success Details:', response);
    setSuccessStatus(`Successfully processed ${type}! Payment ID: ${response.razorpay_payment_id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black font-serif text-slate-900 mb-3">Razorpay Integration Hub</h1>
          <p className="text-slate-500">Test the financial engine for both Doctors and Patients in Test Mode.</p>
        </div>

        {successStatus && (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl mb-8 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-emerald-900">Payment Verified Securely</h3>
              <p className="text-emerald-700 text-sm mt-1">{successStatus}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Patient Booking Flow */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
              <CalendarCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Patient Booking Fee</h2>
            <p className="text-slate-500 text-sm mb-6">Test the flow when a patient books a confirmed appointment or instant telemedicine consult.</p>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 mt-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600 text-sm">Consultation Fee</span>
                <span className="text-slate-900 font-medium">₹500.00 (To Doctor)</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
                <span className="text-slate-600 text-sm">Dehapa Platform Fee</span>
                <span className="text-slate-900 font-medium text-emerald-600">₹100.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Amount to Collect</span>
                <span className="text-xl font-black text-slate-900">₹100.00</span>
              </div>
            </div>

            <RazorpayCheckout 
              amount={100}
              buttonText="PAY ₹100 BOOKING FEE"
              paymentType="PATIENT_BOOKING"
              onSuccess={(res) => handleSuccess('Patient Booking', res)}
              className="w-full py-4 rounded-xl shadow-lg shadow-teal-500/20"
            />
          </div>

          {/* Doctor Premium Flow */}
          <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
            
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 relative z-10 border border-slate-700">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 relative z-10">Premium Doctor Upgrade</h2>
            <p className="text-slate-400 text-sm mb-6 relative z-10">Test the flow when a doctor claims their profile and upgrades to a verified Premium listing.</p>
            
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-8 mt-auto relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">Verified Blue Tick</span>
                <span className="text-emerald-400 text-sm">Included</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700 mb-3">
                <span className="text-slate-400 text-sm">Top Search Ranking</span>
                <span className="text-emerald-400 text-sm">Included</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">Monthly Subscription</span>
                <span className="text-xl font-black text-white">₹500.00</span>
              </div>
            </div>

            <RazorpayCheckout 
              amount={500}
              buttonText="UPGRADE TO PREMIUM (₹500)"
              paymentType="DOCTOR_SUBSCRIPTION"
              onSuccess={(res) => handleSuccess('Doctor Premium Upgrade', res)}
              className="w-full py-4 rounded-xl shadow-lg shadow-teal-500/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
