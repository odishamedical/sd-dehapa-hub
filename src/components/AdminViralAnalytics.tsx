"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  referredBy?: string;
}

interface LeaderboardEntry {
  shortCode: string;
  promoterName: string;
  promoterRole: string;
  promoterEmail: string;
  referralCount: number;
  recentReferrals: UserDoc[];
}

export default function AdminViralAnalytics() {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalReferrals, setTotalReferrals] = useState(0);

  useEffect(() => {
    async function fetchViralData() {
      try {
        const usersRef = collection(db, 'users');
        const snap = await getDocs(usersRef);
        
        const allUsers: UserDoc[] = [];
        snap.forEach(doc => {
          allUsers.push({ uid: doc.id, ...doc.data() } as UserDoc);
        });

        // 1. Build a map of ShortCode -> User (for promoters)
        const codeToUserMap = new Map<string, UserDoc>();
        allUsers.forEach(u => {
          if (u.uid) {
            const shortCode = u.uid.substring(0, 8).toUpperCase();
            codeToUserMap.set(shortCode, u);
          }
        });

        // 2. Group referrals by referredBy
        const referralGroups = new Map<string, UserDoc[]>();
        let total = 0;

        allUsers.forEach(u => {
          if (u.referredBy) {
            total++;
            const group = referralGroups.get(u.referredBy) || [];
            group.push(u);
            referralGroups.set(u.referredBy, group);
          }
        });

        setTotalReferrals(total);

        // 3. Build leaderboard
        const board: LeaderboardEntry[] = [];
        referralGroups.forEach((referrals, code) => {
          const promoter = codeToUserMap.get(code);
          board.push({
            shortCode: code,
            promoterName: promoter?.displayName || 'Unknown User',
            promoterRole: promoter?.role || 'user',
            promoterEmail: promoter?.email || 'N/A',
            referralCount: referrals.length,
            recentReferrals: referrals.slice(0, 5) // keep up to 5 for display
          });
        });

        // 4. Sort by referral count descending
        board.sort((a, b) => b.referralCount - a.referralCount);

        setLeaderboard(board);
      } catch (err) {
        console.error("Error fetching viral data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchViralData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-2xl">🚀</span> Viral Loop Analytics
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Track which doctors, hospitals, and users are successfully inviting others to DehaPa.
          </p>
        </div>
        <div className="bg-gradient-to-r from-fuchsia-50 to-fuchsia-100 border border-fuchsia-200 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-fuchsia-600 shadow-sm border border-fuchsia-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-fuchsia-800 uppercase tracking-widest">Total Network Referrals</p>
            <p className="text-2xl font-black text-fuchsia-900 leading-none mt-0.5">{totalReferrals}</p>
          </div>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <svg className="w-8 h-8 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <p className="font-bold text-slate-900 mb-1">No Referrals Yet</p>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">When users invite others via their unique link, they will appear on this leaderboard.</p>
        </div>
      ) : (
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group">
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4 rounded-tl-xl">Rank</th>
                <th className="px-6 py-4">Promoter Details</th>
                <th className="px-6 py-4">Role / Type</th>
                <th className="px-6 py-4">Referrals</th>
                <th className="px-6 py-4 rounded-tr-xl text-right">Invite Code</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-transparent md:divide-slate-100 p-3 md:p-0">
              {leaderboard.map((entry, index) => (
                <tr key={entry.shortCode} className="block md:table-row bg-white md:bg-transparent mb-3 md:mb-0 border border-slate-200 md:border-none shadow-sm md:shadow-none p-4 md:p-0 rounded-xl md:rounded-none hover:bg-slate-50 transition-colors group">
                  <td className="block md:table-cell px-0 md:px-6 py-0 md:py-4">
                    <div className="flex justify-between items-center md:block">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-slate-200 text-slate-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                          {index + 1}
                        </div>
                        <div className="md:hidden flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{entry.promoterName}</span>
                          <span className="text-xs text-slate-500">{entry.promoterEmail}</span>
                        </div>
                      </div>
                      
                      <div className="md:hidden flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-black text-fuchsia-600 leading-none">{entry.referralCount}</span>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">users</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${entry.promoterRole === 'doctor' ? 'bg-blue-50 text-blue-700 border-blue-200' : entry.promoterRole === 'hospital' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {entry.promoterRole}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{entry.promoterName}</span>
                      <span className="text-xs text-slate-500">{entry.promoterEmail}</span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${entry.promoterRole === 'doctor' ? 'bg-blue-50 text-blue-700 border-blue-200' : entry.promoterRole === 'hospital' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {entry.promoterRole}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-fuchsia-600">{entry.referralCount}</span>
                      <span className="text-xs text-slate-400 font-medium">users</span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 text-right">
                    <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                      {entry.shortCode}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
