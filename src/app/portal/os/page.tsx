"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTenant } from "@/components/TenantContext";

interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  icon: string;
}

// Initial clinical doctors & patients dataset
const PATIENTS = [
  { id: "p-01", name: "Ganesh Prasad", age: 34, gender: "Male", phone: "9876543210", bloodGroup: "O+", city: "Bhubaneswar", allergies: "Penicillin" },
  { id: "p-02", name: "Sunita Mohanty", age: 29, gender: "Female", phone: "9087654321", bloodGroup: "A+", city: "Cuttack", allergies: "Sulfa Drugs" },
  { id: "p-03", name: "Alok Biswal", age: 52, gender: "Male", phone: "9437123456", bloodGroup: "B-", city: "Puri", allergies: "None" },
  { id: "p-04", name: "Priyanka Dash", age: 41, gender: "Female", phone: "8249012345", bloodGroup: "AB+", city: "Rourkela", allergies: "Aspirin" }
];

const PRESET_MOCK_FILES = [
  { name: "CBC_Blood_Report_May2026.pdf", size: "1.2 MB", date: "2026-05-24" },
  { name: "Chest_XRay_Digital_View.png", size: "4.8 MB", date: "2026-05-22" },
  { name: "Lipid_Profile_KIMS_Labs.pdf", size: "940 KB", date: "2026-05-18" },
  { name: "ECG_Waveform_Apollo_Clinic.pdf", size: "2.1 MB", date: "2026-05-12" }
];

export default function ClinicianOS() {
  const router = useRouter();
  const { activeTenant, isLoaded } = useTenant();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>("Dr. Panda");
  const [systemTime, setSystemTime] = useState("");
  
  // State for active windows
  const [windows, setWindows] = useState<Record<string, WindowState>>({
    appointments: { id: "appointments", title: "Patient Queue & Appointments", isOpen: true, isMinimized: false, isMaximized: false, x: 60, y: 50, width: 620, height: 460, zIndex: 10, icon: "📅" },
    prescriptions: { id: "prescriptions", title: "Secure Prescription Pad", isOpen: false, isMinimized: false, isMaximized: false, x: 140, y: 90, width: 550, height: 500, zIndex: 5, icon: "✍️" },
    ehr: { id: "ehr", title: "Patient EHR Vault Explorer", isOpen: false, isMinimized: false, isMaximized: false, x: 220, y: 130, width: 640, height: 480, zIndex: 6, icon: "📂" },
    ambulance: { id: "ambulance", title: "108 Emergency Dispatch Grid", isOpen: false, isMinimized: false, isMaximized: false, x: 300, y: 170, width: 540, height: 420, zIndex: 7, icon: "🚨" }
  });

  const [topZIndex, setTopZIndex] = useState(12);

  // Drag and Drop Tracker
  const [draggingApp, setDraggingApp] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Widget Internals State
  // 1. Appointments Queue
  const [patientQueue, setPatientQueue] = useState([
    { id: "q-1", name: "Ganesh Prasad", time: "10:30 AM", type: "Video", specialty: "Cardiology", status: "Waiting", rating: "O+" },
    { id: "q-2", name: "Sunita Mohanty", time: "11:15 AM", type: "In-Person", specialty: "Pediatrics", status: "Active Consultation", rating: "A+" },
    { id: "q-3", name: "Alok Biswal", time: "12:00 PM", type: "Video", specialty: "Neurology", status: "Waiting", rating: "B-" },
    { id: "q-4", name: "Priyanka Dash", time: "01:30 PM", type: "Video", specialty: "Dermatology", status: "Completed", rating: "AB+" }
  ]);
  const [callingPatient, setCallingPatient] = useState<string | null>(null);

  // 2. Prescription pad inputs
  const [selectedPatientId, setSelectedPatientId] = useState("p-01");
  const [symptomsInput, setSymptomsInput] = useState("");
  const [selectedDrug, setSelectedDrug] = useState("Azithromycin 500mg");
  const [drugFrequency, setDrugFrequency] = useState("1-0-1");
  const [prescriptionNote, setPrescriptionNote] = useState("");
  const [prescriptionToast, setPrescriptionToast] = useState("");

  // 3. EHR vault records
  const [selectedEhrPatientId, setSelectedEhrPatientId] = useState("p-01");
  const [ehrFiles, setEhrFiles] = useState<Record<string, typeof PRESET_MOCK_FILES>>({
    "p-01": [PRESET_MOCK_FILES[0], PRESET_MOCK_FILES[3]],
    "p-02": [PRESET_MOCK_FILES[1], PRESET_MOCK_FILES[2]],
    "p-03": [PRESET_MOCK_FILES[2]],
    "p-04": [PRESET_MOCK_FILES[0], PRESET_MOCK_FILES[1]]
  });
  const [uploadedFileName, setUploadedFileName] = useState("");

  // 4. Ambulance distress dispatcher
  const [ambulanceCalls, setAmbulanceCalls] = useState([
    { id: "c-1", location: "Cuttack NH-16, Near Link Road", issue: "Road accident - Head trauma", status: "Pending", vehicle: "None", eta: "--" },
    { id: "c-2", location: "Puri Temple Road, VIP Lane", issue: "Cardiac emergency - Elderly male", status: "Dispatched", vehicle: "108 Rescue-4", eta: "6 mins" },
    { id: "c-3", location: "Angul Industrial Estate Area", issue: "Home care - Maternity pain", status: "On Scene", vehicle: "108 Rescue-11", eta: "Arrived" }
  ]);

  // Sync auth and user logins
  useEffect(() => {
    const email = localStorage.getItem("sd_current_user_email");
    const name = localStorage.getItem("sd_current_user_name");
    const isComplete = localStorage.getItem("sd_current_user_profile_complete") === "true";

    if (!email) {
      const authCenterBase = window.location.hostname === "localhost" 
        ? "http://localhost:3000" 
        : "https://sd-auth-center.vercel.app";
      window.location.href = `${authCenterBase}?redirect_uri=${encodeURIComponent(window.location.href)}`;
    } else if (!isComplete) {
      router.push("/doctors");
    } else {
      setUserEmail(email);
      setUserName(name ? `Dr. ${name.split(" ")[0]}` : "Dr. Specialist");
    }
  }, [router]);

  // Tick System clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setSystemTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " | " + d.toLocaleDateString([], { day: '2-digit', month: 'short' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!userEmail) return null;

  // Window Focus logic
  const focusWindow = (appId: string) => {
    setWindows(prev => {
      const newZ = topZIndex + 1;
      setTopZIndex(newZ);
      return {
        ...prev,
        [appId]: {
          ...prev[appId],
          isOpen: true,
          isMinimized: false,
          zIndex: newZ
        }
      };
    });
  };

  const toggleWindow = (appId: string) => {
    if (windows[appId].isOpen && !windows[appId].isMinimized) {
      // Minimize it
      setWindows(prev => ({
        ...prev,
        [appId]: { ...prev[appId], isMinimized: true }
      }));
    } else {
      // Open / Restore to front
      focusWindow(appId);
    }
  };

  const closeWindow = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    setWindows(prev => ({
      ...prev,
      [appId]: { ...prev[appId], isOpen: false }
    }));
  };

  const maximizeWindow = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    setWindows(prev => ({
      ...prev,
      [appId]: { ...prev[appId], isMaximized: !prev[appId].isMaximized }
    }));
  };

  // Drag Handlers
  const handleDragStart = (e: React.MouseEvent, appId: string) => {
    if (windows[appId].isMaximized) return; // Prevent drag if maximized
    focusWindow(appId);
    setDraggingApp(appId);
    
    // Get mouse offset relative to the window left/top
    setDragOffset({
      x: e.clientX - windows[appId].x,
      y: e.clientY - windows[appId].y
    });
  };

  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    if (!draggingApp) return;
    
    // Update active window coords
    setWindows(prev => ({
      ...prev,
      [draggingApp]: {
        ...prev[draggingApp],
        x: Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x)),
        y: Math.max(10, Math.min(window.innerHeight - 150, e.clientY - dragOffset.y))
      }
    }));
  };

  const handleGlobalMouseUp = () => {
    if (draggingApp) {
      setDraggingApp(null);
    }
  };

  // 1. Actions: Appointments Queue
  const setQueueStatus = (qId: string, newStatus: string) => {
    setPatientQueue(prev => prev.map(item => item.id === qId ? { ...item, status: newStatus } : item));
  };

  const startCall = (qId: string, pName: string) => {
    setCallingPatient(pName);
    setQueueStatus(qId, "Active Consultation");
  };

  // 2. Actions: Prescription Creator
  const handleSendPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const patientName = PATIENTS.find(p => p.id === selectedPatientId)?.name || "Patient";
    
    setPrescriptionToast(`Dispatched secure Rx for ${patientName}: ${selectedDrug} [${drugFrequency}]`);
    
    // Simulate updating patient EHR record list
    const fileRecord = {
      name: `Rx_${selectedDrug.split(" ")[0]}_WrittenByDoctor.pdf`,
      size: "145 KB",
      date: new Date().toISOString().split("T")[0]
    };
    
    setEhrFiles(prev => ({
      ...prev,
      [selectedPatientId]: [fileRecord, ...(prev[selectedPatientId] || [])]
    }));

    // Clear inputs
    setSymptomsInput("");
    setPrescriptionNote("");
    
    setTimeout(() => {
      setPrescriptionToast("");
    }, 4500);
  };

  // 3. Actions: EHR Vault Lab File Simulation
  const handleUploadSimulator = (patientId: string) => {
    if (!uploadedFileName) return;
    
    const fileRecord = {
      name: uploadedFileName,
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      date: new Date().toISOString().split("T")[0]
    };
    
    setEhrFiles(prev => ({
      ...prev,
      [patientId]: [fileRecord, ...(prev[patientId] || [])]
    }));
    
    setUploadedFileName("");
  };

  // 4. Actions: Emergency Dispatcher Ambulance simulation
  const dispatchAmbulance = (callId: string) => {
    const ambulances = ["108 Rescue-1", "108 Rescue-3", "108 Rescue-9", "108 Rescue-14"];
    const randomAmbulance = ambulances[Math.floor(Math.random() * ambulances.length)];
    
    setAmbulanceCalls(prev => prev.map(c => 
      c.id === callId 
        ? { ...c, status: "Dispatched", vehicle: randomAmbulance, eta: "8 mins" } 
        : c
    ));
    
    // Simulated arrival countdown
    setTimeout(() => {
      setAmbulanceCalls(prev => prev.map(c => 
        c.id === callId && c.vehicle === randomAmbulance
          ? { ...c, status: "On Scene", eta: "Arrived" } 
          : c
      ));
    }, 15000);
  };

  return (
    <div 
      onMouseMove={handleGlobalMouseMove}
      onMouseUp={handleGlobalMouseUp}
      className="min-h-screen bg-[#020610] text-[#f8fafc] overflow-hidden select-none font-sans relative flex flex-col justify-between"
      style={{ height: "100vh" }}
    >
      {/* Background Ambience and Gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-tenant-accent/5 blur-[150px] rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[600px] h-[600px] bg-tenant-accent/5 blur-[150px] rounded-full z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay pointer-events-none z-0"></div>

      {/* Desktop Canvas where Windows sit */}
      <div className="relative flex-1 w-full overflow-hidden p-6 z-10">
        
        {/* Desktop Shortcut Grid */}
        <div className="absolute top-6 left-6 grid grid-cols-1 gap-6 w-28">
          {Object.values(windows).map(app => (
            <div 
              key={app.id}
              onDoubleClick={() => focusWindow(app.id)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-transparent hover:border-slate-800 hover:bg-[#0f172a]/40 backdrop-blur-sm cursor-pointer transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-md">
                {app.icon}
              </div>
              <span className="text-[10px] text-gray-300 font-mono mt-2 leading-tight uppercase font-bold tracking-wider drop-shadow-md">
                {app.title.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Floating Call Consultation Simulation Overlay */}
        {callingPatient && (
          <div className="absolute top-8 right-8 z-[200] w-80 bg-[#0f172a]/95 border-2 border-tenant-accent rounded-2xl p-5 shadow-2xl animate-pulse">
            <span className="text-[9px] font-mono tracking-widest text-tenant-accent uppercase font-bold block mb-1">Encrypted Video consultation</span>
            <h4 className="text-white font-bold text-sm">Dialing: {callingPatient}</h4>
            <p className="text-[11px] text-gray-400 mt-1">Connecting client Medplum vaults...</p>
            <div className="flex gap-2.5 mt-4">
              <button 
                onClick={() => setCallingPatient(null)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                End Call
              </button>
              <button 
                onClick={() => {
                  focusWindow("prescriptions");
                  const patientId = PATIENTS.find(p => p.name === callingPatient)?.id || "p-01";
                  setSelectedPatientId(patientId);
                  setCallingPatient(null);
                }}
                className="flex-1 py-2 bg-tenant-accent text-[#020610] rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity"
              >
                Prescription Pad
              </button>
            </div>
          </div>
        )}

        {/* Global Toast for Prescriptions */}
        {prescriptionToast && (
          <div className="absolute top-8 right-8 z-[200] w-80 bg-green-950/90 border border-green-500/40 rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-in fade-in duration-200">
            <span className="text-xl">🛡️</span>
            <div className="leading-tight text-left">
              <h5 className="text-white font-bold text-xs">Rx Dispatched</h5>
              <p className="text-[9px] text-green-400 mt-0.5">{prescriptionToast}</p>
            </div>
          </div>
        )}

        {/* RENDER WINDOWS */}
        {Object.values(windows).map(app => {
          if (!app.isOpen) return null;
          
          const isFocused = app.zIndex === topZIndex;
          const minimizedClass = app.isMinimized ? "hidden" : "";
          const maximizedStyle = app.isMaximized 
            ? { top: "10px", left: "10px", width: "calc(100% - 20px)", height: "calc(100% - 100px)", zIndex: app.zIndex }
            : { top: `${app.y}px`, left: `${app.x}px`, width: `${app.width}px`, height: `${app.height}px`, zIndex: app.zIndex };

          return (
            <div 
              key={app.id}
              style={maximizedStyle}
              onClick={() => focusWindow(app.id)}
              className={`absolute bg-[#0a1021]/95 border-2 ${isFocused ? 'border-tenant-accent shadow-[0_0_35px_var(--tenant-accent-glow)]' : 'border-slate-800 shadow-xl'} rounded-2xl overflow-hidden flex flex-col transition-all duration-75 ${minimizedClass}`}
            >
              {/* Window Header */}
              <div 
                onMouseDown={(e) => handleDragStart(e, app.id)}
                className="h-10 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between px-4 cursor-move"
              >
                {/* Control buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => closeWindow(e, app.id)}
                    className="w-3 h-3 rounded-full bg-red-500 hover:brightness-75 cursor-pointer flex items-center justify-center text-[7px] text-red-950 font-bold"
                  >
                    ×
                  </button>
                  <button 
                    onClick={() => setWindows(prev => ({ ...prev, [app.id]: { ...prev[app.id], isMinimized: true } }))}
                    className="w-3 h-3 rounded-full bg-yellow-500 hover:brightness-75 cursor-pointer flex items-center justify-center text-[7px] text-yellow-950 font-bold"
                  >
                    -
                  </button>
                  <button 
                    onClick={(e) => maximizeWindow(e, app.id)}
                    className="w-3 h-3 rounded-full bg-green-500 hover:brightness-75 cursor-pointer flex items-center justify-center text-[7px] text-green-950 font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Title */}
                <span className="text-[10px] text-gray-300 font-mono uppercase tracking-widest font-bold">
                  {app.icon} {app.title} {activeTenant.id !== "general" && `(${activeTenant.logoText} Inst)`}
                </span>

                <div className="w-12 h-1" /> {/* Spacer */}
              </div>

              {/* Window Content */}
              <div className="flex-1 overflow-auto p-5 text-left font-sans text-xs">
                
                {/* 1. App: Appointments Scheduler */}
                {app.id === "appointments" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px]">Live Patient Waiting Room</h4>
                      <span className="px-2 py-0.5 bg-tenant-accent/10 border border-tenant-accent/30 text-tenant-accent text-[9px] font-mono rounded">
                        Active Queue: {patientQueue.filter(q => q.status !== "Completed").length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {patientQueue.map(item => {
                        let statusColor = "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
                        if (item.status === "Active Consultation") statusColor = "bg-tenant-accent/20 border-tenant-accent/40 text-tenant-accent";
                        if (item.status === "Completed") statusColor = "bg-green-500/10 border-green-500/30 text-green-400";

                        return (
                          <div key={item.id} className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-[#1e293b] border border-slate-850 flex items-center justify-center font-bold text-[#f8fafc] text-sm">
                                {item.name.charAt(0)}
                              </div>
                              <div className="leading-normal">
                                <h5 className="text-white font-bold">{item.name} <span className="text-[9px] text-gray-500 font-mono">[{item.rating}]</span></h5>
                                <p className="text-[10px] text-gray-400">{item.specialty} • {item.type} session</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono border uppercase ${statusColor}`}>
                                {item.status}
                              </span>
                              
                              <span className="text-gray-450 font-mono text-[10px]">{item.time}</span>
                              
                              {item.status === "Waiting" && (
                                <button 
                                  onClick={() => startCall(item.id, item.name)}
                                  className="px-3 py-1.5 bg-tenant-accent hover:opacity-90 text-[#020610] rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                >
                                  Call
                                </button>
                              )}
                              {item.status === "Active Consultation" && (
                                <button 
                                  onClick={() => setQueueStatus(item.id, "Completed")}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. App: Prescription Pad */}
                {app.id === "prescriptions" && (
                  <form onSubmit={handleSendPrescription} className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px]">FHIR Rx Prescription Dispatch</h4>
                      <span className="text-gray-400 font-mono text-[9px]">Medplum Secure Vault</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest font-mono">Select Patient</label>
                        <select 
                          value={selectedPatientId} 
                          onChange={(e) => setSelectedPatientId(e.target.value)}
                          className="bg-[#0f172a] border border-[#1e293b] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-tenant-accent cursor-pointer"
                        >
                          {PATIENTS.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.age}y/o)</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest font-mono">Select Drug</label>
                        <select 
                          value={selectedDrug} 
                          onChange={(e) => setSelectedDrug(e.target.value)}
                          className="bg-[#0f172a] border border-[#1e293b] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-tenant-accent cursor-pointer"
                        >
                          <option value="Azithromycin 500mg">Azithromycin 500mg (Antibiotic)</option>
                          <option value="Paracetamol 650mg">Paracetamol 650mg (Antipyretic)</option>
                          <option value="Amoxicillin 250mg">Amoxicillin 250mg (Penicillin)</option>
                          <option value="Metformin 500mg">Metformin 500mg (Anti-Diabetic)</option>
                          <option value="Cetirizine 10mg">Cetirizine 10mg (Anti-Histamine)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest font-mono">Dosage Frequency</label>
                        <select 
                          value={drugFrequency} 
                          onChange={(e) => setDrugFrequency(e.target.value)}
                          className="bg-[#0f172a] border border-[#1e293b] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-tenant-accent cursor-pointer"
                        >
                          <option value="1-0-1">1-0-1 (Morning & Night, after meals)</option>
                          <option value="1-0-0">1-0-0 (Morning only, empty stomach)</option>
                          <option value="0-0-1">0-0-1 (Night only, before sleep)</option>
                          <option value="1-1-1">1-1-1 (Three times daily)</option>
                          <option value="As Needed">As Needed (SOS)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest font-mono">Chief Complaints</label>
                        <input 
                          type="text"
                          value={symptomsInput}
                          onChange={(e) => setSymptomsInput(e.target.value)}
                          placeholder="Fever, chest congestion..."
                          required
                          className="bg-[#0f172a] border border-[#1e293b] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-tenant-accent"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-gray-400 uppercase font-bold tracking-widest font-mono">Directions & Special Instructions</label>
                      <textarea 
                        rows={2}
                        value={prescriptionNote}
                        onChange={(e) => setPrescriptionNote(e.target.value)}
                        placeholder="Avoid cold water. Rest for 3 days. Follow up in case fever persists."
                        className="bg-[#0f172a] border border-[#1e293b] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-tenant-accent resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-tenant-gradient-from to-tenant-gradient-to text-[#020610] font-bold text-xs uppercase tracking-widest rounded-xl hover:opacity-95 shadow-md transition-all cursor-pointer"
                    >
                      🔒 Dispatch Secure Rx & Alert Pharmacy
                    </button>
                  </form>
                )}

                {/* 3. App: Patient EHR Vault Explorer */}
                {app.id === "ehr" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px]">Patient Medical Files Ledger</h4>
                      <select 
                        value={selectedEhrPatientId} 
                        onChange={(e) => setSelectedEhrPatientId(e.target.value)}
                        className="bg-[#0f172a] border border-[#1e293b] rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-tenant-accent cursor-pointer"
                      >
                        {PATIENTS.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.gender})</option>
                        ))}
                      </select>
                    </div>

                    {/* Patient Card details */}
                    {(() => {
                      const pObj = PATIENTS.find(p => p.id === selectedEhrPatientId)!;
                      const files = ehrFiles[selectedEhrPatientId] || [];

                      return (
                        <div className="space-y-4">
                          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 grid grid-cols-2 gap-3 font-mono text-[10px] leading-relaxed">
                            <div>
                              <p className="text-gray-400">PATIENT ID: <strong className="text-white">{pObj.id}</strong></p>
                              <p className="text-gray-400">AGE / GENDER: <strong className="text-white">{pObj.age} Yrs / {pObj.gender}</strong></p>
                              <p className="text-gray-400">TELEPHONE: <strong className="text-white">+91 {pObj.phone}</strong></p>
                            </div>
                            <div>
                              <p className="text-gray-400">BLOOD SCOPE: <strong className="text-white">{pObj.bloodGroup}</strong></p>
                              <p className="text-gray-400">ODISHA REGION: <strong className="text-white">{pObj.city} District</strong></p>
                              <p className="text-gray-400">DRUG ALLERGIES: <strong className="text-red-400 uppercase font-bold">{pObj.allergies}</strong></p>
                            </div>
                          </div>

                          {/* Files list */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h5 className="font-bold text-gray-300 uppercase tracking-widest text-[9px] font-mono">FHIR Medical Documents ({files.length})</h5>
                              
                              {/* Mock File upload actions */}
                              <div className="flex items-center gap-2">
                                <select 
                                  value={uploadedFileName} 
                                  onChange={(e) => setUploadedFileName(e.target.value)}
                                  className="bg-[#0f172a] border border-[#1e293b] rounded-lg px-2 py-1 text-[9px] text-white focus:outline-none focus:border-tenant-accent cursor-pointer"
                                >
                                  <option value="">-- Simulated Lab Report File --</option>
                                  <option value="Urinalysis_LabReport_Complete.pdf">Urinalysis_LabReport_Complete.pdf</option>
                                  <option value="Thyroid_Profile_T3_T4_TSH.pdf">Thyroid_Profile_T3_T4_TSH.pdf</option>
                                  <option value="COVID_RT_PCR_OdishaLabs.pdf">COVID_RT_PCR_OdishaLabs.pdf</option>
                                  <option value="Chest_CTScan_Reconstruction.jpg">Chest_CTScan_Reconstruction.jpg</option>
                                </select>
                                <button 
                                  onClick={() => handleUploadSimulator(pObj.id)}
                                  disabled={!uploadedFileName}
                                  className="px-2 py-1 bg-tenant-accent hover:opacity-90 disabled:opacity-50 text-[#020610] rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                                >
                                  Upload
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2 max-h-[160px] overflow-auto">
                              {files.length > 0 ? (
                                files.map((file, idx) => (
                                  <div key={idx} className="bg-[#0f172a] border border-[#1e293b]/50 p-2.5 rounded-lg flex items-center justify-between hover:border-slate-800 transition-colors">
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-lg">📄</span>
                                      <div className="leading-tight">
                                        <p className="text-white font-mono text-[10px] font-bold">{file.name}</p>
                                        <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">{file.date} • {file.size}</p>
                                      </div>
                                    </div>
                                    <a 
                                      href="#" 
                                      onClick={(e) => { e.preventDefault(); alert(`Simulating file download of: ${file.name} (Medplum FHIR hash valid)`); }}
                                      className="text-tenant-accent text-[9px] font-mono font-bold uppercase hover:underline"
                                    >
                                      Download
                                    </a>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center text-[10px] text-gray-500 py-6 font-mono">No documents associated with this patient.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 4. App: 108 Emergency Dispatch Grid */}
                {app.id === "ambulance" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <h4 className="font-bold text-white uppercase tracking-wider font-mono text-[10px]">Odisha Health Ministry Distress Ledger</h4>
                      <span className="px-2 py-0.5 bg-red-950 border border-red-500/40 text-red-400 text-[9px] font-mono rounded animate-pulse">
                        Active Emergency Alerts
                      </span>
                    </div>

                    <div className="space-y-3">
                      {ambulanceCalls.map(c => {
                        let badgeClass = "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
                        if (c.status === "Dispatched") badgeClass = "bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse";
                        if (c.status === "On Scene") badgeClass = "bg-green-500/10 border-green-500/30 text-green-400";

                        return (
                          <div key={c.id} className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-800 transition-colors">
                            <div className="space-y-1 leading-normal">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono border uppercase ${badgeClass}`}>
                                  {c.status}
                                </span>
                                <span className="text-white font-bold font-mono text-[10px]">{c.location}</span>
                              </div>
                              <p className="text-[10px] text-red-300 font-sans">{c.issue}</p>
                              {c.vehicle !== "None" && (
                                <p className="text-[9px] text-gray-400 font-mono">Ambulance: <strong className="text-white">{c.vehicle}</strong> (ETA: {c.eta})</p>
                              )}
                            </div>

                            <div>
                              {c.status === "Pending" ? (
                                <button 
                                  onClick={() => dispatchAmbulance(c.id)}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer shadow shadow-red-500/20"
                                >
                                  Dispatch 108
                                </button>
                              ) : (
                                <span className="text-gray-500 font-mono text-[9px] uppercase tracking-wider block py-1.5">
                                  Track GPS
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}

      </div>

      {/* Center Bottom Taskbar Dock (macOS-style) */}
      <footer className="relative z-50 px-6 pb-6 w-full flex justify-center pointer-events-none">
        <div className="flex items-center gap-4 bg-[#0f172a]/60 backdrop-blur-xl border border-[#1e293b]/60 px-6 py-3.5 rounded-3xl shadow-[0_15px_40px_rgba(2,6,16,0.8)] pointer-events-auto transition-colors duration-500">
          
          {/* Dashboard Icon */}
          <Link 
            href="/portal" 
            className="flex flex-col items-center justify-center w-11 h-11 bg-[#1e293b]/40 rounded-xl hover:bg-[#1e293b] transition-colors group cursor-pointer relative"
            title="Go to Patient Dashboard"
          >
            <span className="text-lg">🏡</span>
            <span className="absolute bottom-1 w-1 h-1 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <div className="h-6 w-[1px] bg-slate-800" />

          {/* Apps Toggle triggers */}
          {Object.values(windows).map(app => {
            const hasIndicatorDot = app.isOpen;
            const isWindowFocused = app.isOpen && !app.isMinimized && app.zIndex === topZIndex;

            return (
              <button
                key={app.id}
                onClick={() => toggleWindow(app.id)}
                className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all group relative cursor-pointer ${
                  isWindowFocused ? 'bg-tenant-accent/20 border border-tenant-accent/30' : 'bg-[#1e293b]/40 hover:bg-[#1e293b]'
                }`}
                title={app.title}
              >
                <span className="text-lg group-hover:scale-105 transition-transform">{app.icon}</span>
                {hasIndicatorDot && (
                  <span className={`absolute bottom-1 w-1 h-1 rounded-full ${
                    isWindowFocused ? 'bg-tenant-accent animate-pulse' : 'bg-gray-400'
                  }`} />
                )}
              </button>
            );
          })}

          <div className="h-6 w-[1px] bg-slate-800" />

          {/* Clock & System Info Widget */}
          <div className="flex flex-col justify-center px-2 font-mono leading-tight text-right text-[10px] text-gray-400">
            <span className="text-white font-bold text-[11px] tracking-wider">{systemTime.split(" | ")[0]}</span>
            <span className="text-[8px] text-tenant-accent tracking-widest uppercase font-bold">{systemTime.split(" | ")[1]}</span>
          </div>

          <div className="h-6 w-[1px] bg-slate-800" />

          {/* Logout / Exit */}
          <Link 
            href="/"
            className="flex flex-col items-center justify-center w-11 h-11 bg-red-950/20 hover:bg-red-950/60 border border-red-900/30 rounded-xl transition-all group cursor-pointer"
            title="Exit Clinician OS"
          >
            <span className="text-lg">❌</span>
          </Link>

        </div>
      </footer>

    </div>
  );
}
