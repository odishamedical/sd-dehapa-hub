"use client";

import React from 'react';

export default function AmbulanceGuideView() {
  return (
    <div className="bg-slate-900/50 backdrop-blur-3xl rounded-[32px] p-8 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4 text-slate-300">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">🚑 The Complete Ambulance Owner Guide</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Welcome to DehaPa! This guide is designed to help you understand your dashboard. We will walk you through every section, page, and button so you know exactly how to set up your profile, manage your drivers, and accept live emergencies.
          </p>
        </div>

        {/* SECTION 1 */}
        <section className="space-y-6">
          <div className="border-b border-slate-700/50 pb-4">
            <h2 className="text-2xl font-bold text-teal-400">1. Profile & Registration Section</h2>
            <p className="text-slate-400 font-medium mt-1">Objective: To build your public profile so patients and hospitals can find you, trust you, and book your ambulances.</p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 shadow-inner">
            <h3 className="text-lg font-bold text-white mb-2">📝 Step 1: Personal Profile</h3>
            <p className="text-sm text-slate-400 mb-4"><strong className="text-slate-300">What this page is for:</strong> This is where you tell us who you are as the business owner.</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400">
              <li><strong className="text-slate-300">Fields you will see:</strong> Name, Email, Phone Number.</li>
              <li><strong className="text-slate-300">What to do:</strong> Fill in your basic contact details.</li>
              <li><strong className="text-slate-300">Action Button:</strong> Click <strong className="text-teal-400">"Save & Continue ➔"</strong> at the bottom to move to the next step.</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 shadow-inner">
            <h3 className="text-lg font-bold text-white mb-2">📝 Step 2: Property Identity & Info (Ambulance Setup)</h3>
            <p className="text-sm text-slate-400 mb-4"><strong className="text-slate-300">What this page is for:</strong> This is the most important page! Here you define your fleet and your ambulance services.</p>
            
            <div className="my-6 rounded-xl overflow-hidden shadow-lg border border-white/10 bg-slate-950 p-2">
              <img src="/images/guides/dashboard_profile_setup.png" alt="Profile Setup & Driver Assignment" className="w-full h-auto rounded-lg" />
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400">
              <li><strong className="text-slate-300">Service Name:</strong> The name of your ambulance service (e.g., "City Lifeline Ambulance").</li>
              <li><strong className="text-slate-300">Vehicle Setup:</strong> You can add multiple vehicles. For each vehicle, enter the <strong className="text-slate-300">Vehicle Number Plate</strong>.</li>
              <li><strong className="text-slate-300">Driver Assignment (Crucial):</strong> For each vehicle, you must assign a driver by entering their email address. <em className="text-teal-300">When your driver logs in with this email, they will automatically receive emergency requests for this specific vehicle.</em></li>
              <li><strong className="text-slate-300">Action Button:</strong> Click <strong className="text-teal-400">"Save & Continue ➔"</strong> at the bottom.</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 shadow-inner">
            <h3 className="text-lg font-bold text-white mb-2">📝 Step 3: Bank Details</h3>
            <p className="text-sm text-slate-400 mb-4"><strong className="text-slate-300">What this page is for:</strong> To ensure you receive online payments smoothly.</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400">
              <li><strong className="text-slate-300">Fields:</strong> Account Name, Account Number, IFSC Code.</li>
              <li><strong className="text-slate-300">Action Button:</strong> Click <strong className="text-teal-400">"Save & Finish"</strong>. Once you click this, your public profile is successfully submitted and goes to our admin team for quick approval!</li>
            </ul>
          </div>
        </section>

        {/* SECTION 2 */}
        <section className="space-y-6">
          <div className="border-b border-slate-700/50 pb-4">
            <h2 className="text-2xl font-bold text-rose-400">2. Dispatch & Operations Section</h2>
            <p className="text-slate-400 font-medium mt-1">Objective: To manage your live ambulance fleet and handle incoming emergency requests from patients and hospitals.</p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 shadow-inner">
            <h3 className="text-lg font-bold text-white mb-2">📍 Live Dispatch Page</h3>
            <p className="text-sm text-slate-400 mb-4"><strong className="text-slate-300">What this page is for:</strong> This is the "Control Center" for your drivers. Your drivers should keep this page open on their phones.</p>
            
            <div className="my-6 flex justify-center">
              <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-lg border border-white/10 bg-slate-950 p-2">
                <img src="/images/guides/live_dispatch_screen.png" alt="Incoming Live Dispatch Screen" className="w-full h-auto rounded-lg" />
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400">
              <li><strong className="text-slate-300">Incoming Requests:</strong> When a patient books your ambulance, a card will appear here with a flashing red light and the status <code className="bg-slate-900 px-1 py-0.5 rounded text-rose-300">Pending Confirmation</code>.</li>
              <li><strong className="text-slate-300">Accept Button:</strong> The driver clicks the <strong className="text-rose-400">"Accept"</strong> button to tell the patient they are on the way.</li>
              <li><strong className="text-slate-300">Start GPS Broadcast Button:</strong> Your driver must click this button! It turns on their live GPS so the patient can see the ambulance approaching on a map (just like Uber).</li>
              <li><strong className="text-slate-300">Ride Code Field:</strong> When the driver reaches the patient, the patient will give them a 4-digit Ride Code. The driver types this in and clicks <strong className="text-rose-400">"Verify Code"</strong> to complete the trip.</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 shadow-inner">
            <h3 className="text-lg font-bold text-white mb-2">🗺️ Fleet Command Map Page</h3>
            <p className="text-sm text-slate-400 mb-4"><strong className="text-slate-300">What this page is for:</strong> This is for YOU (the owner) to track your ambulances.</p>
            
            <div className="my-6 rounded-xl overflow-hidden shadow-lg border border-white/10 bg-slate-950 p-2">
              <img src="/images/guides/fleet_command_map.png" alt="Live Fleet Command Map" className="w-full h-auto rounded-lg" />
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400">
              <li><strong className="text-slate-300">The Live Map:</strong> You will see a large city map showing the exact real-time location of every driver who has clicked "Start GPS Broadcast".</li>
              <li><strong className="text-slate-300">Vehicle Markers:</strong> Click on any ambulance icon on the map to see the driver's name, their email, and exactly when their GPS last updated.</li>
            </ul>
          </div>
        </section>

        {/* SECTION 3 */}
        <section className="space-y-6">
          <div className="border-b border-slate-700/50 pb-4">
            <h2 className="text-2xl font-bold text-emerald-400">3. Finance Section</h2>
            <p className="text-slate-400 font-medium mt-1">Objective: To track how much money your fleet is making.</p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 shadow-inner">
            <h3 className="text-lg font-bold text-white mb-2">💰 My Earnings & Collections (For Drivers)</h3>
            <p className="text-sm text-slate-400 mb-4"><strong className="text-slate-300">What this page is for:</strong> Your drivers can open this tab to see exactly how much cash they have collected from patients today.</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400">
              <li><strong className="text-slate-300">Total Revenue:</strong> Shows the sum of all completed trips for that specific driver.</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 shadow-inner">
            <h3 className="text-lg font-bold text-white mb-2">📈 Fleet Earnings Ledger (For Owners)</h3>
            <p className="text-sm text-slate-400 mb-4"><strong className="text-slate-300">What this page is for:</strong> A master view of your entire business revenue.</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400">
              <li><strong className="text-slate-300">Fleet Total:</strong> See the combined earnings of every single ambulance in your fleet.</li>
              <li><strong className="text-slate-300">Driver Breakdown:</strong> It shows a list of your drivers and exactly how much money each driver has collected, making it very easy for you to settle accounts at the end of the day.</li>
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6 pt-8 border-t border-white/10">
          <h2 className="text-2xl font-black text-white">Frequently Asked Questions (FAQ)</h2>
          
          <div className="space-y-4">
            <div className="bg-slate-950/50 rounded-xl p-5 border border-white/5">
              <h4 className="font-bold text-white mb-2">Q: How do patients actually book my ambulance?</h4>
              <p className="text-slate-400 text-sm">A: Once you complete the Profile Setup and click "Save & Finish", your ambulance appears in the DehaPa public directory. Patients can search for you and click the <strong className="text-rose-400">"Emergency Dispatch"</strong> button on your profile.</p>
            </div>
            
            <div className="bg-slate-950/50 rounded-xl p-5 border border-white/5">
              <h4 className="font-bold text-white mb-2">Q: Why is my driver not seeing any emergency requests?</h4>
              <p className="text-slate-400 text-sm">A: Check Step 2 (Property Identity). Make sure you have entered the exact email address the driver used to log in, and that they are assigned to the correct Vehicle Number Plate.</p>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-5 border border-white/5">
              <h4 className="font-bold text-white mb-2">Q: How do I know when I have successfully submitted my profile?</h4>
              <p className="text-slate-400 text-sm">A: On the last step of the profile builder (Bank Details), there is a <strong className="text-teal-400">"Save & Finish"</strong> button. Once you click that, a green success message will appear, meaning your profile is complete and submitted!</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
