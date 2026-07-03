"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/utils/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export default function LiveHealthFeed({ userName, userEmail }: { userName: string | null, userEmail?: string }) {
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    const fetchFeed = async () => {
      try {
        const feed: any[] = [];
        
        // 1. Fetch Prescriptions
        const rxQuery = query(
          collection(db, 'prescriptions'),
          where('patientId', '==', userEmail),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const rxDocs = await getDocs(rxQuery);
        rxDocs.forEach(doc => {
          const data = doc.data();
          // parse timestamp
          let timeLabel = 'Recently';
          let ts = 0;
          if (data.createdAt) {
            const date = typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt.toDate?.() || new Date();
            timeLabel = date.toLocaleDateString();
            ts = date.getTime();
          }
          feed.push({
            id: doc.id,
            type: 'prescription',
            title: `New prescription from Dr. ${data.doctorName || 'Doctor'}`,
            desc: `Diagnosis: ${data.diagnosis || 'General Consult'}`,
            time: timeLabel,
            timestamp: ts,
            icon: <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
            bg: 'bg-indigo-50'
          });
        });

        // 2. Fetch Active Queue
        const qQuery = query(
          collection(db, 'queue'),
          where('patientEmail', '==', userEmail),
          where('status', 'in', ['waiting', 'in-progress']),
          limit(2)
        );
        const qDocs = await getDocs(qQuery);
        qDocs.forEach(doc => {
          const data = doc.data();
          feed.push({
            id: doc.id,
            type: 'queue',
            title: `Currently in queue at ${data.clinicName || 'Clinic'}`,
            desc: `Your queue number is ${data.queueNumber || 'pending'}. Status: ${data.status}.`,
            time: 'Live',
            timestamp: Date.now() + 10000, // Show active queue at top
            icon: <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
            bg: 'bg-emerald-50'
          });
        });

        // Sort feed
        feed.sort((a, b) => b.timestamp - a.timestamp);
        setFeedItems(feed);
      } catch (error) {
        console.error("Error fetching live feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [userEmail]);
  // END OF FETCH

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[24px] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
          </span>
          Live Health Feed
        </h3>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="text-sm text-slate-500 animate-pulse">Loading feed...</div>
        ) : feedItems.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h4 className="text-slate-700 font-bold mb-1">No recent activity</h4>
            <p className="text-slate-500 text-xs">Your timeline will automatically update when you connect with a provider or receive a prescription.</p>
          </div>
        ) : (
          feedItems.map((item) => (
            <div key={item.id} className="flex gap-4 items-start group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.bg} group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <div className="flex-1 pb-4 border-b border-slate-100 group-last:border-0 group-last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0 whitespace-nowrap">{item.time}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
