"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export default function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add User State
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    role: 'Patient'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Assuming 'users' is the collection
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users", err);
      // Fallback if index doesn't exist
      try {
        const snap = await getDocs(collection(db, 'users'));
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (fallbackErr) {
        console.error("Fallback failed", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || (!newUser.phone && !newUser.email)) {
      alert("Name and either Phone or Email are required.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const docId = newUser.phone ? newUser.phone : newUser.email;
      const cleanId = docId.replace(/[^a-zA-Z0-9@.]/g, ''); // basic sanitize
      
      const userRef = doc(collection(db, 'users'), cleanId);
      
      const payload = {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(userRef, payload);
      alert(`User ${newUser.name} added successfully!`);
      
      setIsAdding(false);
      setNewUser({ name: '', phone: '', email: '', gender: 'Male', role: 'Patient' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to add user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(`Are you sure you want to permanently delete this user?`)) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[80vh]">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
        <div>
          <h3 className="text-xl font-bold text-slate-900">User & Patient Directory</h3>
          <p className="text-sm text-slate-500 mt-1">Manage all {users.length} registered patients and standard users.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">
            Export CSV
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            {isAdding ? "Cancel" : "+ Add New Patient"}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="p-6 border-b border-slate-200 bg-teal-50/50 shrink-0">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            Register New Patient
          </h4>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Full Name *</label>
              <input 
                type="text" required
                value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 shadow-sm text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" 
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Phone Number</label>
              <input 
                type="tel" 
                value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 shadow-sm text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" 
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Email Address</label>
              <input 
                type="email" 
                value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 shadow-sm text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" 
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Gender</label>
              <select 
                value={newUser.gender} onChange={e => setNewUser({...newUser, gender: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 shadow-sm text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none form-select"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-4 py-2.5 shadow-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Patient"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <p className="font-bold text-slate-900 mb-1">No Active Users</p>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">Click "Add New Patient" to manually register users.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Registered</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{user.gender || "Unknown"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">{user.phone || "No Phone"}</div>
                    <div className="text-xs text-slate-500">{user.email || "No Email"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      {user.role || 'Patient'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
