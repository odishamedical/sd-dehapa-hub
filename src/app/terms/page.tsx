import React from 'react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the DehaPa platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
            <p>DehaPa provides a digital healthcare network connecting patients with doctors, hospitals, pharmacies, and diagnostic labs. We facilitate communication, including via WhatsApp Business API, to streamline healthcare delivery.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. WhatsApp Communications</h2>
            <p>By registering on DehaPa, you consent to receive important notifications, appointment updates, and messages via WhatsApp. You can opt-out at any time by replying "STOP" or managing your communication preferences in your profile.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information when using our platform.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Privacy</h2>
            <p>Your use of DehaPa is also governed by our <Link href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>, which details how we collect, use, and protect your personal and medical information.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at <strong>shyamdash@gmail.com</strong>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
