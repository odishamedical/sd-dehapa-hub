import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Dehapa Hub',
  description: 'Privacy Policy for Dehapa Health Directory and WhatsApp Services.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-2xl border border-slate-100">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: June 2026</p>

        <div className="space-y-8 text-base leading-relaxed text-slate-600">
          
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to Dehapa Hub. We are committed to protecting your personal information and your right to privacy. 
              If you have any questions or concerns about our policy, or our practices with regards to your personal 
              information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
            <p>
              We collect personal information that you voluntarily provide to us when expressing an interest in obtaining 
              information about us or our products and services. The personal information that we collect depends on the 
              context of your interactions with us, and may include:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Names, Phone Numbers, and Email Addresses</li>
              <li>Business/Clinic information for directory listings</li>
              <li>WhatsApp chat history when interacting with our official bot</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <p>
              We use personal information collected via our website and WhatsApp services for a variety of business purposes described below:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To facilitate account creation and verification processes.</li>
              <li>To send administrative information to you, such as directory listing verifications.</li>
              <li>To provide customer support and respond to inquiries via WhatsApp.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. WhatsApp Data Processing</h2>
            <p>
              By interacting with the Dehapa WhatsApp Business account, you consent to the processing of your messages 
              by our automated systems to provide directory searches, support, and notifications. We do not sell your 
              message data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Deletion</h2>
            <p>
              You have the right to request the deletion of your personal data. If you wish to have your directory 
              listing or WhatsApp data removed from our systems, please contact our support team, and we will process 
              your request promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Contact Us</h2>
            <p>
              If you have questions or comments about this policy, you may email us at our official support email.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
