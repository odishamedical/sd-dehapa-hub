"use client";

import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
  link?: string;
  createdAt: any;
}

export default function GlobalNotifications({ userEmail }: { userEmail: string | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userEmail) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('recipientEmail', '==', userEmail),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(notifs);
    }, (error) => {
      console.warn("Error fetching notifications:", error);
    });

    return () => unsubscribe();
  }, [userEmail]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await updateDoc(doc(db, 'notifications', notification.id), { read: true });
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    for (const id of unreadIds) {
      updateDoc(doc(db, 'notifications', id), { read: true }).catch(console.error);
    }
  };

  if (!userEmail) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/80 rounded-full transition-colors border border-slate-700 focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full border border-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0a111a]/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-[120] overflow-hidden flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50 shrink-0">
            <h3 className="font-bold text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] uppercase tracking-widest font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 rounded-xl cursor-pointer transition-colors border ${notif.read ? 'bg-transparent border-transparent hover:bg-slate-800/50' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80'} flex gap-3`}
                >
                  <div className="mt-1 shrink-0">
                    {notif.type === 'success' && <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>}
                    {notif.type === 'info' && <div className="w-2 h-2 mt-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>}
                    {notif.type === 'warning' && <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>}
                    {notif.type === 'error' && <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${notif.read ? 'text-slate-300' : 'text-white'}`}>{notif.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-mono">
                      {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
