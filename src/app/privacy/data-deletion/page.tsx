import React from 'react';
import Link from 'next/link';

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 mb-6">User Data Deletion Instructions</h1>
        
        <div className="space-y-6 text-slate-700 leading-relaxed">
          <p className="text-lg text-slate-500 mb-6">
            At DehaPa, we respect your privacy. If you wish to delete your account or any data associated with your Facebook or WhatsApp profile on our platform, please follow the instructions below.
          </p>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Option 1: Deleting via Facebook Settings</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Log into your Facebook account.</li>
              <li>Go to <strong>Settings & Privacy</strong> &gt; <strong>Settings</strong>.</li>
              <li>Navigate to <strong>Apps and Websites</strong>.</li>
              <li>Find <strong>Dehapa</strong> in the list of active apps.</li>
              <li>Click <strong>Remove</strong> and confirm. This will sever the connection and instruct our systems to purge your social login data.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Option 2: Direct Request to DehaPa Data Protection Officer</h2>
            <p className="mb-2">You can request a full deletion of your medical records, profile data, and communication history by contacting our Data Protection Officer:</p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p><strong>Name:</strong> Shyam Sundar Dash</p>
              <p><strong>Email:</strong> shyamdash@gmail.com</p>
              <p><strong>Subject:</strong> Account Data Deletion Request</p>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Upon receiving your email, we will verify your identity and delete all associated data within 72 hours, subject to any legal medical record retention requirements.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-100">
            <Link href="/privacy" className="text-teal-600 font-bold hover:underline">
              &larr; Back to full Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
