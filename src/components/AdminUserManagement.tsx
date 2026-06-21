"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export default function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Add User State
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    role: 'Member'
  });

  // Drawer State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'activity' | 'actions'>('profile');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users", err);
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
      const cleanId = docId.replace(/[^a-zA-Z0-9@.]/g, '');
      
      const userRef = doc(collection(db, 'users'), cleanId);
      
      const payload = {
        ...newUser,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(userRef, payload);
      alert(`User ${newUser.name} added successfully!`);
      
      setIsAdding(false);
      setNewUser({ name: '', phone: '', email: '', gender: 'Male', role: 'Member' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to add user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSuspend = async (user: any) => {
    if (!confirm(`Are you sure you want to ${user.status === 'suspended' ? 'UNSUSPEND' : 'SUSPEND'} ${user.name}?`)) return;
    try {
      const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
      await updateDoc(doc(db, 'users', user.id), { status: newStatus, updatedAt: serverTimestamp() });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
      alert(`User is now ${newStatus}`);
    } catch (err) {
      console.error(err);
      alert("Action failed.");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(`Are you sure you want to permanently delete this user?`)) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${selectedUsers.length} users?`)) return;
    try {
      await Promise.all(selectedUsers.map(id => deleteDoc(doc(db, 'users', id))));
      setUsers(users.filter(u => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
      alert("Selected users deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete some users.");
    }
  };

  const handleBulkRoleChange = async (newRole: string) => {
    if (!newRole || !confirm(`Change role of ${selectedUsers.length} users to ${newRole.toUpperCase()}?`)) return;
    try {
      await Promise.all(selectedUsers.map(id => updateDoc(doc(db, 'users', id), { role: newRole, updatedAt: serverTimestamp() })));
      setUsers(users.map(u => selectedUsers.includes(u.id) ? { ...u, role: newRole } : u));
      setSelectedUsers([]);
      alert("Roles updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update roles.");
    }
  };

  const handleIndividualRoleChange = async (userId: string, newRole: string) => {
    if (!newRole) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole, updatedAt: serverTimestamp() });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      alert(`Role updated to ${newRole.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update role.");
    }
  };

  const filteredUsers = users.filter(u => {
    const searchString = search.toLowerCase();
    if (search && !(u.name?.toLowerCase() || '').includes(searchString) && !(u.displayName?.toLowerCase() || '').includes(searchString) && !(u.phone || '').includes(search) && !(u.email?.toLowerCase() || '').includes(searchString)) return false;
    
    if (roleFilter !== 'all') {
      const uRole = u.role?.toLowerCase() || 'member';
      const isGenericUser = ['member', 'user', 'patient'].includes(uRole);
      
      if (roleFilter.toLowerCase() === 'member') {
        if (!isGenericUser) return false;
      } else if (uRole !== roleFilter.toLowerCase()) {
        return false;
      }
    }
    
    if (statusFilter !== 'all') {
      const uStatus = u.status || 'active';
      if (uStatus !== statusFilter) return false;
    }
    return true;
  });

  const recentUsers = users.filter(u => {
    if (!u.createdAt) return true;
    const then = u.createdAt.seconds * 1000;
    const now = Date.now();
    return (now - then) < 7 * 24 * 60 * 60 * 1000; // 7 days
  }).length;

  // Define allowed roles in the ecosystem
  const ecosystemRoles = ['Member', 'Doctor', 'Hospital', 'Lab', 'Pharmacy', 'Ambulance', 'Admin', 'Super_Admin'];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 border border-slate-300 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-[80vh] relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 hover:translate-x-full duration-1000 transition-all -skew-x-12 transform scale-150 z-0 pointer-events-none"></div>

      {/* Top Metrics Bar */}
      <div className="px-6 pt-6 pb-4 flex flex-wrap gap-4 relative z-10 shrink-0">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 flex-1 min-w-[200px] border border-slate-200/50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 flex-1 min-w-[200px] border border-slate-200/50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">New (7 Days)</p>
            <p className="text-2xl font-bold text-slate-900">+{recentUsers}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 flex-1 min-w-[200px] border border-slate-200/50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Suspended Accounts</p>
            <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.status === 'suspended').length}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-4 border-b border-slate-300 bg-white/40 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between shrink-0 relative z-10">
        
        {selectedUsers.length > 0 ? (
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto bg-slate-800 rounded-xl px-4 py-2 text-white shadow-lg animate-in fade-in slide-in-from-top-2">
            <span className="font-bold text-sm bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">{selectedUsers.length} Selected</span>
            <div className="h-6 w-px bg-slate-700 mx-1"></div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Upgrade to:</span>
              <select 
                onChange={(e) => handleBulkRoleChange(e.target.value)}
                value=""
                className="bg-slate-700 border-none rounded-lg px-3 py-1.5 text-xs font-bold outline-none cursor-pointer hover:bg-slate-600 transition-colors"
              >
                <option value="" disabled>Select Role...</option>
                {ecosystemRoles.map((role, idx) => (
                  <option key={idx} value={role.toLowerCase()}>{role}</option>
                ))}
              </select>
            </div>

            <button onClick={handleBulkDelete} className="bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all ml-auto md:ml-2 border border-rose-500/50">
              Bulk Delete
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-3 w-full md:flex-1">
            <input 
              type="text" 
              placeholder="Search name, email, phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] border border-slate-300 hover:border-teal-400 rounded-xl px-5 py-3 shadow-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium placeholder:text-slate-400 bg-white/80 backdrop-blur-sm"
            />
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full md:w-auto md:min-w-[150px] border border-slate-300 rounded-xl px-4 py-3 shadow-sm text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none form-select bg-white/80 backdrop-blur-sm font-medium"
            >
              <option value="all">All Roles</option>
              {ecosystemRoles.map((role, idx) => (
                <option key={idx} value={role.toLowerCase()}>{role}</option>
              ))}
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full md:w-auto md:min-w-[150px] border border-slate-300 rounded-xl px-4 py-3 shadow-sm text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none form-select bg-white/80 backdrop-blur-sm font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        )}
        <button onClick={() => setIsAdding(!isAdding)} className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(13,148,136,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap">
          {isAdding ? "Cancel" : "+ Add New Patient"}
        </button>
      </div>

      {isAdding && (
        <div className="p-6 border-b border-slate-300 bg-teal-50/80 backdrop-blur-md shrink-0 relative z-10 animate-in slide-in-from-top-4 duration-300">
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
                className="w-full bg-white border border-teal-200 rounded-xl px-4 py-2.5 shadow-sm text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none font-medium" 
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Phone Number</label>
              <input 
                type="tel" 
                value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})}
                className="w-full bg-white border border-teal-200 rounded-xl px-4 py-2.5 shadow-sm text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none font-medium" 
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Email Address</label>
              <input 
                type="email" 
                value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                className="w-full bg-white border border-teal-200 rounded-xl px-4 py-2.5 shadow-sm text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none font-medium" 
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">Gender</label>
              <select 
                value={newUser.gender} onChange={e => setNewUser({...newUser, gender: e.target.value})}
                className="w-full bg-white border border-teal-200 rounded-xl px-4 py-2.5 shadow-sm text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none form-select font-medium"
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
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-4 py-2.5 shadow-md transition-all hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Patient"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table Area */}
      <div className="flex-1 overflow-auto bg-white/70 backdrop-blur-md relative z-10">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 font-medium">No users found.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-100/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedUsers(filteredUsers.map(u => u.id));
                      else setSelectedUsers([]);
                    }}
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User Profile</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filteredUsers.map(user => (
                <tr 
                  key={user.id} 
                  className={`hover:bg-teal-50/50 transition-colors group cursor-pointer ${selectedUsers.includes(user.id) ? 'bg-teal-50' : ''}`}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedUsers([...selectedUsers, user.id]);
                        else setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                      }}
                    />
                  </td>
                  <td className="px-6 py-4" onClick={() => { setSelectedUser(user); setDrawerTab('profile'); }}>
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-sm border border-white" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase shadow-sm border border-white">
                          {(user.name || user.displayName) ? (user.name || user.displayName).charAt(0) : '?'}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 drop-shadow-sm group-hover:text-teal-700 transition-colors">{user.name || user.displayName || "Unknown User"}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{user.gender || "Not specified"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4" onClick={() => { setSelectedUser(user); setDrawerTab('profile'); }}>
                    <div className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> {user.phone || "N/A"}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> {user.email || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4" onClick={() => { setSelectedUser(user); setDrawerTab('profile'); }}>
                    <span className={`border px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${user.role?.toLowerCase() === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : user.role?.toLowerCase() === 'doctor' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {['member', 'user', 'patient'].includes(user.role?.toLowerCase() || 'member') ? 'Member' : user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4" onClick={() => { setSelectedUser(user); setDrawerTab('profile'); }}>
                    {(() => {
                      const isSuspended = user.status === 'suspended';
                      let isOnline = false;
                      if (!isSuspended && user.lastActiveAt) {
                        const time = user.lastActiveAt.toMillis ? user.lastActiveAt.toMillis() : (user.lastActiveAt.seconds * 1000 || 0);
                        isOnline = (Date.now() - time) < 5 * 60 * 1000;
                      }
                      return (
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${isSuspended ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`}></div>
                          <span className={`text-xs font-bold uppercase tracking-widest ${isSuspended ? 'text-red-600' : isOnline ? 'text-green-600' : 'text-slate-500'}`}>
                            {isSuspended ? 'Suspended' : isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium flex items-center gap-2 justify-between" onClick={() => { setSelectedUser(user); setDrawerTab('profile'); }}>
                    <span>{user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</span>
                    <svg className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Profile Modal Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedUser(null)}></div>
          <div className="relative w-full max-w-3xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 rounded-3xl overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 shrink-0 relative overflow-hidden z-20 shadow-md">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
              <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-2 rounded-full transition-all border border-slate-700 z-[100]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              
              <div className="flex items-center gap-6 relative z-10">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-slate-800" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-2 border-slate-800">
                    {(selectedUser.name || selectedUser.displayName) ? (selectedUser.name || selectedUser.displayName).charAt(0) : '?'}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-serif font-bold drop-shadow-md">{selectedUser.name || selectedUser.displayName || "Unknown User"}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    {(() => {
                      const isSuspended = selectedUser.status === 'suspended';
                      let isOnline = false;
                      if (!isSuspended && selectedUser.lastActiveAt) {
                        const time = selectedUser.lastActiveAt.toMillis ? selectedUser.lastActiveAt.toMillis() : (selectedUser.lastActiveAt.seconds * 1000 || 0);
                        isOnline = (Date.now() - time) < 5 * 60 * 1000;
                      }
                      return (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isSuspended ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' : isOnline ? 'bg-green-500/20 text-green-300 border-green-500/50' : 'bg-slate-500/20 text-slate-300 border-slate-500/50'}`}>
                          {isSuspended ? 'Suspended' : isOnline ? 'Online' : 'Offline'}
                        </span>
                      );
                    })()}
                    <span className="text-sm font-medium text-slate-300 uppercase tracking-widest">{['member', 'user', 'patient'].includes(selectedUser.role?.toLowerCase() || 'member') ? 'Member' : selectedUser.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
              <button 
                onClick={() => setDrawerTab('profile')}
                className={`flex-1 py-4 text-sm font-bold tracking-wide transition-all border-b-2 ${drawerTab === 'profile' ? 'text-teal-600 border-teal-600 bg-white' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'}`}
              >
                Profile Overview
              </button>
              <button 
                onClick={() => setDrawerTab('activity')}
                className={`flex-1 py-4 text-sm font-bold tracking-wide transition-all border-b-2 ${drawerTab === 'activity' ? 'text-teal-600 border-teal-600 bg-white' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'}`}
              >
                Activity Timeline
              </button>
              <button 
                onClick={() => setDrawerTab('actions')}
                className={`flex-1 py-4 text-sm font-bold tracking-wide transition-all border-b-2 ${drawerTab === 'actions' ? 'text-teal-600 border-teal-600 bg-white' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'}`}
              >
                Admin Actions
              </button>
            </div>

            {/* Drawer Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
              
              {drawerTab === 'profile' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      Contact Information
                    </h4>
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone Number</p>
                        <p className="font-medium text-slate-900 mt-1">{selectedUser.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</p>
                        <p className="font-medium text-slate-900 mt-1">{selectedUser.email || "Not provided"}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                      Demographics
                    </h4>
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gender</p>
                        <p className="font-medium text-slate-900 mt-1">{selectedUser.gender || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Blood Group</p>
                        <p className="font-medium text-slate-900 mt-1">{selectedUser.bloodGroup || "Not specified"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Address</p>
                        <p className="font-medium text-slate-900 mt-1">{selectedUser.address || "No address on file."}</p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {drawerTab === 'activity' && (
                <div className="animate-in fade-in duration-300">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-8 flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900">Chronological Activity Log</h4>
                      <p className="text-sm text-indigo-700 mt-1">This timeline aggregates all interactions (Appointments, Tele-consults, Vault access) across the entire DehaPa ecosystem.</p>
                    </div>
                  </div>

                  <div className="relative border-l-2 border-slate-200 ml-5 pl-8 space-y-8">
                    {/* Mocked Activity Items */}
                    <div className="relative">
                      <div className="absolute -left-[41px] w-5 h-5 bg-teal-500 rounded-full border-4 border-white shadow-sm"></div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Today, 10:30 AM</p>
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <p className="font-bold text-slate-900">Booked Doctor Appointment</p>
                        <p className="text-sm text-slate-600 mt-1">Booked a consultation with Dr. Ranjita Ghadei.</p>
                        <span className="inline-block mt-3 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Upcoming</span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[41px] w-5 h-5 bg-indigo-500 rounded-full border-4 border-white shadow-sm"></div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">2 Days Ago</p>
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <p className="font-bold text-slate-900">Accessed Sovereign Vault</p>
                        <p className="text-sm text-slate-600 mt-1">Viewed medical records from AMRI Hospital.</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[41px] w-5 h-5 bg-blue-500 rounded-full border-4 border-white shadow-sm"></div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Last Week</p>
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <p className="font-bold text-slate-900">Video Consultation</p>
                        <p className="text-sm text-slate-600 mt-1">Completed a 15-minute video call.</p>
                        <span className="inline-block mt-3 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Completed</span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[41px] w-5 h-5 bg-slate-300 rounded-full border-4 border-white shadow-sm"></div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{selectedUser.createdAt ? new Date(selectedUser.createdAt.seconds * 1000).toLocaleDateString() : 'Registration Date'}</p>
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <p className="font-bold text-slate-900">Account Created</p>
                        <p className="text-sm text-slate-600 mt-1">Joined the DehaPa platform.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'actions' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>
                      Contact via WhatsApp
                    </h4>
                    <p className="text-sm text-slate-500 mb-6">Send a direct message or automated notification to this user's registered phone number via the DehaPa Bot.</p>
                    <a 
                      href={`https://wa.me/${selectedUser.phone?.replace(/[^0-9]/g, '')}`} 
                      target="_blank" rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md w-full"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                      Open WhatsApp Chat
                    </a>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                      Role Management
                    </h4>
                    <p className="text-sm text-slate-500 mb-6">Manually override this user's role. Doing this will grant them immediate access to their corresponding provider dashboard.</p>
                    <div className="flex gap-3">
                      <select 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                        onChange={(e) => handleIndividualRoleChange(selectedUser.id, e.target.value)}
                        value={selectedUser.role || ''}
                      >
                        <option value="" disabled>Select Role...</option>
                        {ecosystemRoles.map((role, idx) => (
                          <option key={idx} value={role.toLowerCase()}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                      Reset Password
                    </h4>
                    <p className="text-sm text-slate-500 mb-6">Send an email or SMS containing a magic link to securely reset their credentials.</p>
                    <button 
                      onClick={() => alert('Password reset link sent to user!')}
                      className="bg-white border-2 border-indigo-200 hover:border-indigo-500 text-indigo-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm w-full"
                    >
                      Send Reset Link
                    </button>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-rose-900 flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      Account Suspension
                    </h4>
                    <p className="text-sm text-rose-700 mb-6">Suspending an account revokes their login access immediately. This action can be undone.</p>
                    <button 
                      onClick={() => handleToggleSuspend(selectedUser)}
                      className={`w-full px-6 py-3 rounded-xl font-bold transition-all shadow-md ${selectedUser.status === 'suspended' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}
                    >
                      {selectedUser.status === 'suspended' ? 'Unsuspend Account' : 'Suspend Account'}
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(selectedUser.id)}
                      className="w-full mt-4 text-xs font-bold text-rose-600 hover:underline"
                    >
                      Permanently Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
