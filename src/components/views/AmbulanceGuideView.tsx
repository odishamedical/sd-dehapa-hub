"use client";

import React from 'react';

export default function AmbulanceGuideView() {
  return (
    <div className="bg-white/30 backdrop-blur-[40px] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 animate-in fade-in slide-in-from-bottom-4 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">🚑 The Complete DehaPa Ambulance Owner Guide</h1>
          <p className="text-lg text-slate-600">
            Welcome to DehaPa! This guide is designed to help you, the Ambulance Owner, understand your dashboard. We will walk you through every section, page, and button so you know exactly how to set up your profile, manage your drivers, and accept live emergencies.
          </p>
        </div>

        {/* SECTION 1 */}
        <section className="space-y-6">
          <div className="border-b border-slate-200/50 pb-4">
            <h2 className="text-2xl font-bold text-teal-700">1. Profile & Registration Section</h2>
            <p className="text-slate-500 font-medium mt-1">Objective: To build your public profile so patients and hospitals can find you, trust you, and book your ambulances.</p>
          </div>

          <div className="bg-white/60 rounded-2xl p-6 border border-white">
            <h3 className="text-lg font-bold text-slate-900 mb-2">📝 Step 1: Personal Profile</h3>
            <p className="text-sm text-slate-600 mb-4"><strong>What this page is for:</strong> This is where you tell us who you are as the business owner.</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              <li><strong>Fields you will see:</strong> Name, Email, Phone Number.</li>
              <li><strong>What to do:</strong> Fill in your basic contact details.</li>
              <li><strong>Action Button:</strong> Click <strong>"Save & Continue ➔"</strong> at the bottom to move to the next step.</li>
            </ul>
          </div>

          <div className="bg-white/60 rounded-2xl p-6 border border-white">
            <h3 className="text-lg font-bold text-slate-900 mb-2">📝 Step 2: Property Identity & Info (Ambulance Setup)</h3>
            <p className="text-sm text-slate-600 mb-4"><strong>What this page is for:</strong> This is the most important page! Here you define your fleet and your ambulance services.</p>
            
            <div className="my-6 rounded-xl overflow-hidden shadow-md border border-slate-200">
              {/* Note: The image path from the artifact is local to the IDE, we will use a generic placeholder or omit image in production code, but since user wanted pictures, we'll embed an illustration style div or omit actual local paths since they won't load on the web. Let's use generic placeholders or just structural boxes to represent the images for now. */}
              <div className="bg-teal-50 aspect-video flex items-center justify-center p-6 text-center">
                <div>
                  <svg className="w-12 h-12 mx-auto text-teal-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span className="text-teal-600 font-bold text-sm">Dashboard Profile Setup Screenshot</span>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              <li><strong>Service Name:</strong> The name of your ambulance service (e.g., "City Lifeline Ambulance").</li>
              <li><strong>Vehicle Setup:</strong> You can add multiple vehicles. For each vehicle, enter the <strong>Vehicle Number Plate</strong>.</li>
              <li><strong>Driver Assignment (Crucial):</strong> For each vehicle, you must assign a driver by entering their email address. <em>When your driver logs in with this email, they will automatically receive emergency requests for this specific vehicle.</em></li>
              <li><strong>Action Button:</strong> Click <strong>"Save & Continue ➔"</strong> at the bottom.</li>
            </ul>
          </div>

          <div className="bg-white/60 rounded-2xl p-6 border border-white">
            <h3 className="text-lg font-bold text-slate-900 mb-2">📝 Step 3: Bank Details</h3>
            <p className="text-sm text-slate-600 mb-4"><strong>What this page is for:</strong> To ensure you receive online payments smoothly.</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              <li><strong>Fields:</strong> Account Name, Account Number, IFSC Code.</li>
              <li><strong>Action Button:</strong> Click <strong>"Save & Finish"</strong>. Once you click this, your public profile is successfully submitted and goes to our admin team for quick approval!</li>
            </ul>
          </div>
        </section>

        {/* SECTION 2 */}
        <section className="space-y-6">
          <div className="border-b border-slate-200/50 pb-4">
            <h2 className="text-2xl font-bold text-rose-700">2. Dispatch & Operations Section</h2>
            <p className="text-slate-500 font-medium mt-1">Objective: To manage your live ambulance fleet and handle incoming emergency requests from patients and hospitals.</p>
          </div>

          <div className="bg-white/60 rounded-2xl p-6 border border-white">
            <h3 className="text-lg font-bold text-slate-900 mb-2">📍 Live Dispatch Page</h3>
            <p className="text-sm text-slate-600 mb-4"><strong>What this page is for:</strong> This is the "Control Center" for your drivers. Your drivers should keep this page open on their phones.</p>
            
            <div className="my-6 rounded-xl overflow-hidden shadow-md border border-slate-200">
              <div className="bg-rose-50 aspect-video flex items-center justify-center p-6 text-center">
                <div>
                  <svg className="w-12 h-12 mx-auto text-rose-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                  <span className="text-rose-600 font-bold text-sm">Mobile Driver Dispatch Screenshot</span>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              <li><strong>Incoming Requests:</strong> When a patient books your ambulance, a card will appear here with a flashing red light and the status <code>Pending Confirmation</code>.</li>
              <li><strong>Accept Button:</strong> The driver clicks the <strong>"Accept"</strong> button to tell the patient they are on the way.</li>
              <li><strong>Start GPS Broadcast Button:</strong> Your driver must click this button! It turns on their live GPS so the patient can see the ambulance approaching on a map (just like Uber).</li>
              <li><strong>Ride Code Field:</strong> When the driver reaches the patient, the patient will give them a 4-digit Ride Code. The driver types this in and clicks <strong>"Verify Code"</strong> to complete the trip.</li>
            </ul>
          </div>

          <div className="bg-white/60 rounded-2xl p-6 border border-white">
            <h3 className="text-lg font-bold text-slate-900 mb-2">🗺️ Fleet Command Map Page</h3>
            <p className="text-sm text-slate-600 mb-4"><strong>What this page is for:</strong> This is for YOU (the owner) to track your ambulances.</p>
            
            <div className="my-6 rounded-xl overflow-hidden shadow-md border border-slate-200">
              <div className="bg-indigo-50 aspect-video flex items-center justify-center p-6 text-center">
                <div>
                  <svg className="w-12 h-12 mx-auto text-indigo-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7l6-3 5.553 2.776A1 1 0 0121 7.618v10.764a1 1 0 01-1.447.894L15 17l-6 3z"></path></svg>
                  <span className="text-indigo-600 font-bold text-sm">Fleet Command Map Screenshot</span>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              <li><strong>The Live Map:</strong> You will see a large city map showing the exact real-time location of every driver who has clicked "Start GPS Broadcast".</li>
              <li><strong>Vehicle Markers:</strong> Click on any ambulance icon on the map to see the driver's name, their email, and exactly when their GPS last updated.</li>
            </ul>
          </div>
        </section>

        {/* SECTION 3 */}
        <section className="space-y-6">
          <div className="border-b border-slate-200/50 pb-4">
            <h2 className="text-2xl font-bold text-emerald-700">3. Finance Section</h2>
            <p className="text-slate-500 font-medium mt-1">Objective: To track how much money your fleet is making.</p>
          </div>

          <div className="bg-white/60 rounded-2xl p-6 border border-white">
            <h3 className="text-lg font-bold text-slate-900 mb-2">💰 My Earnings & Collections (For Drivers)</h3>
            <p className="text-sm text-slate-600 mb-4"><strong>What this page is for:</strong> Your drivers can open this tab to see exactly how much cash they have collected from patients today.</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              <li><strong>Total Revenue:</strong> Shows the sum of all completed trips for that specific driver.</li>
            </ul>
          </div>

          <div className="bg-white/60 rounded-2xl p-6 border border-white">
            <h3 className="text-lg font-bold text-slate-900 mb-2">📈 Fleet Earnings Ledger (For Owners)</h3>
            <p className="text-sm text-slate-600 mb-4"><strong>What this page is for:</strong> A master view of your entire business revenue.</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              <li><strong>Fleet Total:</strong> See the combined earnings of every single ambulance in your fleet.</li>
              <li><strong>Driver Breakdown:</strong> It shows a list of your drivers and exactly how much money each driver has collected, making it very easy for you to settle accounts at the end of the day.</li>
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6 pt-8 border-t-2 border-slate-200">
          <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions (FAQ)</h2>
          
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2">Q: How do patients actually book my ambulance?</h4>
              <p className="text-slate-600 text-sm">A: Once you complete the Profile Setup and click "Save & Finish", your ambulance appears in the DehaPa public directory. Patients can search for you and click the <strong>"Emergency Dispatch"</strong> button on your profile.</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2">Q: Why is my driver not seeing any emergency requests?</h4>
              <p className="text-slate-600 text-sm">A: Check Step 2 (Property Identity). Make sure you have entered the exact email address the driver used to log in, and that they are assigned to the correct Vehicle Number Plate.</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2">Q: How do I know when I have successfully submitted my profile?</h4>
              <p className="text-slate-600 text-sm">A: On the last step of the profile builder (Bank Details), there is a <strong>"Save & Finish"</strong> button. Once you click that, a green success message will appear, meaning your profile is complete and submitted!</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
