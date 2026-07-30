"use client";

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, setDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UploadCloud, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, Loader2, Save, X, Phone, Mail, Image as ImageIcon, Briefcase, Info, Settings, AlertTriangle, Calendar, Star, TrendingUp, Search, Lock, Edit3 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PremiumSlugModal from './PremiumSlugModal';
import AddressBlock from './AddressBlock';
import ImageCropper from './ImageCropper';
import { generateUniversalSeoUrl } from '@/lib/urlHelpers';
import { indianStates, districtsByState, blocksByDistrict } from '@/lib/locations';
import InlineEditArray from './InlineEditArray';
import ObjectArrayEditor from './ObjectArrayEditor';
import { directoryConfig } from '@/lib/directoryConfig';
import { AdminCard, AdminHeader } from '@/components/admin/ui';

export default function AdminDataCRM() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  
  // Location Filters
  const [countryFilter, setCountryFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [blockFilter, setBlockFilter] = useState("");

  // Drawer state
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isNewListing, setIsNewListing] = useState(false);
  
  // Custom Slug Check
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailability, setSlugAvailability] = useState<{status: 'idle' | 'checking' | 'available' | 'taken', message: string}>({status: 'idle', message: ''});
  const [isSlugModalOpen, setIsSlugModalOpen] = useState(false);

  // Image Cropping
  const [imageFileToCrop, setImageFileToCrop] = useState<File | null>(null);
  const [imageUrlToCrop, setImageUrlToCrop] = useState<string | null>(null);
  
  // Selection and bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isBulking, setIsBulking] = useState(false);
  
  // Advanced features state
  const [activeTab, setActiveTab] = useState("basic");
  const [dynamicFields, setDynamicFields] = useState<{label: string, value: string}[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [qualificationsList, setQualificationsList] = useState<any[]>([]);
  const [research, setResearch] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [healthPackages, setHealthPackages] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const recordsRef = collection(db, 'directory');
      const snapshot = await getDocs(recordsRef);
      const fetchedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setData(fetchedData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item => {
    if (search && !item.name?.toLowerCase().includes(search.toLowerCase()) && !item.phone?.includes(search)) return false;
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (verifiedFilter !== "all") {
      if (verifiedFilter === "verified" && !item.verified) return false;
      if (verifiedFilter === "unverified" && item.verified) return false;
    }
    if (countryFilter && item.country && item.country !== countryFilter) return false;
    if (stateFilter && item.state !== stateFilter) return false;
    if (districtFilter && item.district !== districtFilter) return false;
    if (blockFilter && item.city !== blockFilter && item.block !== blockFilter) return false; // checking both city and block for backward compatibility
    return true;
  }).sort((a: any, b: any) => {
    const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0);
    const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0);
    if (sortOption === "newest") return bTime - aTime;
    if (sortOption === "oldest") return aTime - bTime;
    if (sortOption === "recent_update") return (b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0) - (a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0);
    if (sortOption === "alpha") return (a.name || "").localeCompare(b.name || "");
    return 0;
  });

  const uniqueCategories = Array.from(new Set(['Doctor', 'Hospital', 'Pharmacy', 'Lab', 'Ambulance', ...data.map(d => d.category).filter(Boolean)]));
  
  const totalEntities = data.length;
  const pendingVerifications = data.filter(d => !d.verified).length;
  const hiddenRecords = data.filter(d => d.isPublished === false).length;

  const openDrawer = (listing: any) => {
    setActiveTab("basic");
    setIsNewListing(false);
    setSelectedListing({ ...listing });
    setDynamicFields(listing.customFields || []);
    setLocations(listing.locations || []);
    setExperiences(listing.experiences || []);
    setQualificationsList(listing.qualificationsList || []);
    setResearch(listing.research || []);
    setAwards(listing.awards || []);
    setDepartments(listing.departments || []);
    setHealthPackages(listing.healthPackages || []);
    setSlugAvailability({status: 'idle', message: ''});
    setIsDrawerOpen(true);
  };

  const handleCreateNew = () => {
    setActiveTab("basic");
    setIsNewListing(true);
    setSelectedListing({
      id: "NEW_" + Date.now().toString(),
      name: "",
      phone: "",
      address: "",
      category: "",
      subCategory: "",
      city: "",
      district: "",
      verified: false,
      customSlug: "",
      source: "manual_entry",
      tenantId: "default",
      isPublished: true,
      adminLocked: false,
      youtubeLinks: [],
      totalBeds: "",
      icuCapacity: "",
      emergencyServices: ""
    });
    setDynamicFields([]);
    setLocations([]);
    setExperiences([]);
    setQualificationsList([]);
    setResearch([]);
    setAwards([]);
    setDepartments([]);
    setHealthPackages([]);
    setSlugAvailability({status: 'idle', message: ''});
    setIsDrawerOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedListing) return;
    setImageFileToCrop(e.target.files[0]);
    setImageUrlToCrop(null);
    e.target.value = ''; // Reset input so same file can be selected again
  };

  const handleRawImageClick = (url: string) => {
    setImageUrlToCrop(url);
    setImageFileToCrop(null);
  };

  const handleCroppedImage = async (croppedBlob: Blob, isPrimary: boolean) => {
    if (!selectedListing) return;
    setImageFileToCrop(null);
    setImageUrlToCrop(null);
    setIsUploadingImage(true);
    try {
      const fileExt = "jpg";
      const fileName = `${isPrimary ? 'profile' : 'gallery'}_crop_${Date.now()}.${fileExt}`;
      const fileRef = ref(storage, `directory/${selectedListing.id || Date.now()}/${fileName}`);
      await uploadBytes(fileRef, croppedBlob);
      const url = await getDownloadURL(fileRef);
      
      if (isPrimary) {
        setSelectedListing({ ...selectedListing, image: url });
      } else {
        const existingGallery = selectedListing.galleryImages || [];
        setSelectedListing({ ...selectedListing, galleryImages: [...existingGallery, url] });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload cropped image");
    }
    setIsUploadingImage(false);
  };

  const checkSlugAvailability = async () => {
    if (!selectedListing?.customSlug) return;
    setIsCheckingSlug(true);
    setSlugAvailability({status: 'checking', message: 'Checking availability...'});
    try {
      const q = query(collection(db, 'directory'), where("customSlug", "==", selectedListing.customSlug.toLowerCase()));
      const snap = await getDocs(q);
      
      const takenByOthers = snap.docs.filter(doc => doc.id !== selectedListing.id);
      
      if (takenByOthers.length === 0) {
        setSlugAvailability({status: 'available', message: 'Available! You can use this slug.'});
      } else {
        setSlugAvailability({status: 'taken', message: 'Taken! This slug is already in use.'});
      }
    } catch (err) {
      console.error(err);
      setSlugAvailability({status: 'idle', message: 'Error checking slug.'});
    }
    setIsCheckingSlug(false);
  };

  const handleArrayChange = (setter: any, array: any[], index: number, key: string, val: string) => {
    const newArr = [...array];
    newArr[index][key] = val;
    setter(newArr);
  };

  const addDynamicField = () => setDynamicFields([...dynamicFields, { label: "", value: "" }]);
  const updateDynamicField = (index: number, key: 'label' | 'value', val: string) => {
    const newFields = [...dynamicFields];
    newFields[index][key] = val;
    setDynamicFields(newFields);
  };
    const removeDynamicField = (index: number) => setDynamicFields(dynamicFields.filter((_, i) => i !== index));

  const generateMagicLink = () => {
    if (!selectedListing || !selectedListing.id) return;
    if (selectedListing.id.startsWith("NEW_")) {
      alert("Please Save the listing first before generating a link.");
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dehapa.com';
    const link = `${origin}/invite/${selectedListing.id}`;
    navigator.clipboard.writeText(link);
    alert(`Magic Link Copied!\n\n${link}\n\nSend this via WhatsApp. When the doctor clicks it, they will instantly take ownership of this profile.`);
  };

  const handleInstantVerify = () => {
    if (!selectedListing?.assignedOwnerEmail) {
      alert("Please enter an email address first.");
      return;
    }
    setSelectedListing({
      ...selectedListing,
      ownerEmail: selectedListing.assignedOwnerEmail.toLowerCase().trim(),
      verified: true
    });
    alert("Listing marked as Verified and Assigned! Please click 'Save Changes' below to permanently save to the database.");
  };

  const handleSave = async () => {
    if (!selectedListing) return;
    setIsSaving(true);
    try {
      const cleanDynamicFields = dynamicFields.filter(f => f.label.trim() !== "" && f.value.trim() !== "");
      const cleanLocations = locations.filter(l => l.name?.trim() !== "");
      const cleanExperiences = experiences.filter(e => e.role?.trim() !== "" || e.hospital?.trim() !== "");
      const cleanQualifications = qualificationsList.filter(q => q.degree?.trim() !== "");
      const cleanResearch = research.filter(r => r.title?.trim() !== "");
      const cleanAwards = awards.filter(a => a.name?.trim() !== "");
      
      const updatedData = {
        name: selectedListing.name || "",
        phone: selectedListing.phone || "",
        address: selectedListing.address || "",
        category: selectedListing.category || "",
        subCategory: selectedListing.subCategory || "",
        city: selectedListing.city || "",
        district: selectedListing.district || "",
        verified: selectedListing.verified || false,
        isPublished: selectedListing.isPublished !== undefined ? selectedListing.isPublished : true,
        adminLocked: selectedListing.adminLocked || false,
        customSlug: selectedListing.customSlug?.trim() || "",
        videoFee: selectedListing.videoFee || "",
        consultationFee: selectedListing.consultationFee || "",
        launchFee: selectedListing.launchFee || "",
        isTestAccount: selectedListing.isTestAccount || false,
        clinicName: selectedListing.clinicName || "",
        ...selectedListing,
        customFields: cleanDynamicFields,
        locations: cleanLocations,
        experiences: cleanExperiences,
        qualificationsList: cleanQualifications,
        research: cleanResearch,
        awards: cleanAwards,
        departments: departments.filter(d => d.name?.trim() !== ""),
        healthPackages: healthPackages.filter(h => h.packageName?.trim() !== ""),
        galleryImages: selectedListing.galleryImages || [],
        rawImages: selectedListing.rawImages || [],
        youtubeLinks: selectedListing.youtubeLinks || [],
        totalBeds: selectedListing.totalBeds || "",
        icuCapacity: selectedListing.icuCapacity || "",
        emergencyServices: selectedListing.emergencyServices || "",
        updatedAt: serverTimestamp()
      };

      if (isNewListing) {
        const newRef = doc(collection(db, 'directory'));
        const fullData = {
          ...updatedData,
          source: 'manual_entry',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(newRef, fullData);
        setData([{ id: newRef.id, ...fullData }, ...data]);
        
        // --- WhatsApp Automation ---
        if (updatedData.phone) {
          try {
            const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dehapa.com';
            // We route to /profile/slug or /profile/id depending on setup. Assuming /directory/slug is the public URL, but I will use the domain we know.
            const profileSlug = updatedData.customSlug || newRef.id;
            const profileUrl = `${origin}/directory/${profileSlug}`;
            const displayName = updatedData.category === 'Doctor' ? `Dr. ${updatedData.name}` : updatedData.name;
            
            fetch('/api/whatsapp/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                to: updatedData.phone, 
                messageType: 'template',
                templateName: 'dehapa_listing_notice',
                parameters: [displayName, profileUrl]
              })
            }).catch(err => console.error('WhatsApp auto-invite error:', err));
          } catch (e) {
            console.error('WhatsApp invite block error:', e);
          }
        }
        // ---------------------------
      } else {
        const ref = doc(db, 'directory', selectedListing.id);
        await updateDoc(ref, { ...updatedData, updatedAt: new Date() });
        setData(data.map(d => d.id === selectedListing.id ? { ...d, ...updatedData } : d));
      }
      setIsDrawerOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save listing.");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedListing) return;
    if (!confirm(`Are you sure you want to permanently delete "${selectedListing.name}"?`)) return;
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, 'directory', selectedListing.id));
      setData(data.filter(d => d.id !== selectedListing.id));
      setIsDrawerOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to delete listing.");
    }
    setIsSaving(false);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected listings?`)) return;
    setIsDeletingBulk(true);
    try {
      await Promise.all(selectedIds.map(id => deleteDoc(doc(db, 'directory', id))));
      setData(data.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    } catch (e) {
      console.error(e);
      alert("Failed to delete selected listings.");
    }
    setIsDeletingBulk(false);
  };

  const handleDeleteAllFiltered = async () => {
    if (filteredData.length === 0) return alert("No records to delete.");
    const isWiping = filteredData.length === data.length;
    
    if (isWiping) {
      const check = prompt(`DANGER: You are about to PERMANENTLY wipe ALL ${data.length} records in the database!\n\nType "DELETE" to confirm:`);
      if (check !== "DELETE") return;
    } else {
      if (!confirm(`Are you sure you want to PERMANENTLY delete all ${filteredData.length} filtered records?`)) return;
    }
    
    setIsDeletingBulk(true);
    try {
      const idsToDelete = filteredData.map(d => d.id);
      await Promise.all(idsToDelete.map(id => deleteDoc(doc(db, 'directory', id))));
      setData(data.filter(d => !idsToDelete.includes(d.id)));
      setSelectedIds([]);
      alert(`Successfully deleted ${idsToDelete.length} records.`);
    } catch (e) {
      console.error(e);
      alert("Failed to delete records.");
    }
    setIsDeletingBulk(false);
  };

  const handleBulkUpdate = async (updateField: string, updateValue: any) => {
    if (selectedIds.length === 0) return;
    const actionName = updateField === 'verified' && updateValue ? "Verify" : updateField === 'verified' && !updateValue ? "Unverify" : updateField === 'isPublished' && updateValue ? "Publish" : "Unpublish";
    if (!confirm(`Are you sure you want to ${actionName} ${selectedIds.length} selected listings?`)) return;
    setIsBulking(true);
    try {
      await Promise.all(selectedIds.map(id => updateDoc(doc(db, 'directory', id), { [updateField]: updateValue, updatedAt: serverTimestamp() })));
      setData(data.map(d => selectedIds.includes(d.id) ? { ...d, [updateField]: updateValue } : d));
      setSelectedIds([]);
    } catch (e) {
      console.error(e);
      alert(`Failed to ${actionName} selected listings.`);
    }
    setIsBulking(false);
  };

  const handleExportCSV = () => {
    const dataToExport = selectedIds.length > 0 
      ? data.filter(d => selectedIds.includes(d.id)) 
      : filteredData;
      
    if (dataToExport.length === 0) return alert("No data to export.");
    const headers = ["ID", "Name", "Category", "Phone", "City", "District", "Verified", "Visible"];
    const csvRows = [headers.join(",")];
    for (const row of dataToExport) {
      const values = [
        row.id,
        `"${(row.name || "").replace(/"/g, '""')}"`,
        `"${(row.category || "").replace(/"/g, '""')}"`,
        `"${row.phone || ""}"`,
        `"${row.city || ""}"`,
        `"${row.district || ""}"`,
        row.verified ? "Yes" : "No",
        row.isPublished !== false ? "Yes" : "No"
      ];
      csvRows.push(values.join(","));
    }
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `directory_export_${Date.now()}.csv`);
    a.click();
  };

  const handleMigrateLegacy = async () => {
    setIsBulking(true);
    try {
      const possibleCollections = ['service_providers', 'google_places', 'crawler_data', 'scraped_listings', 'doctors', 'hospitals'];
      let foundCollection = null;
      let snap = null;

      for (const col of possibleCollections) {
        const testRef = collection(db, col);
        const testSnap = await getDocs(query(testRef, limit(1)));
        if (!testSnap.empty) {
          foundCollection = col;
          snap = await getDocs(testRef);
          break;
        }
      }

      if (!foundCollection) {
        alert("No legacy records found in any known legacy collection (service_providers, google_places, etc.). Did you perhaps forget to click 'Inject to Database' when scraping?");
        setIsBulking(false);
        return;
      }
      
      if (!confirm(`Found ${snap.docs.length} records in '${foundCollection}'. Do you want to migrate them to 'directory'?`)) {
        setIsBulking(false);
        return;
      }
      
      let count = 0;
      for (const docSnap of snap.docs) {
        const dData = docSnap.data();
        await setDoc(doc(db, 'directory', docSnap.id), {
          ...dData,
          migratedFromLegacy: true,
          legacyCollection: foundCollection,
          updatedAt: serverTimestamp()
        }, { merge: true });
        count++;
      }
      
      alert(`Migration complete! Successfully migrated ${count} legacy records from ${foundCollection}. Refreshing data...`);
      await fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed during migration process. Check console for errors.");
    }
    setIsBulking(false);
  };


  return (
    <AdminCard noPadding className="h-[80vh] flex flex-col">
      <AdminHeader 
        title={
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
            Directory Data CRM
          </div>
        }
        description={`Manage all ${data.length} records in the ecosystem`}
        actions={
          <>
            <button onClick={() => { setCountryFilter(""); setStateFilter(""); setDistrictFilter(""); setBlockFilter(""); setSearch(""); setCategoryFilter(""); }} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-3 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Reset
            </button>
            <button onClick={handleMigrateLegacy} disabled={isBulking} className="bg-amber-600 hover:bg-amber-500 text-white border border-amber-500 px-4 py-3 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
              {isBulking ? "Migrating..." : "Migrate Legacy Data"}
            </button>
            <select 
              value={countryFilter} 
              onChange={e => { setCountryFilter(e.target.value); setStateFilter(""); setDistrictFilter(""); setBlockFilter(""); }}
              className="border border-slate-700 rounded-xl px-4 py-3 shadow-sm text-sm focus:border-teal-500 focus:ring-2 outline-none w-full md:w-32 form-select bg-slate-800/80 text-white backdrop-blur-sm font-medium"
            >
              <option value="">All Countries</option>
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UAE">UAE</option>
              <option value="Australia">Australia</option>
              <option value="England">England</option>
            </select>
            {countryFilter === "India" && (
              <select 
                value={stateFilter} 
                onChange={e => { setStateFilter(e.target.value); setDistrictFilter(""); setBlockFilter(""); }}
                className="border border-white/10 rounded-xl px-4 py-3 shadow-sm text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none w-full md:w-32 form-select bg-slate-800/50 backdrop-blur-sm font-medium text-slate-200"
              >
                <option value="">All States</option>
                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            {stateFilter && districtsByState[stateFilter] && (
              <select 
                value={districtFilter} 
                onChange={e => { setDistrictFilter(e.target.value); setBlockFilter(""); }}
                className="border border-white/10 rounded-xl px-4 py-3 shadow-sm text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none w-full md:w-36 form-select bg-slate-800/50 backdrop-blur-sm font-medium text-slate-200"
              >
                <option value="">All Districts</option>
                {districtsByState[stateFilter].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            {districtFilter && blocksByDistrict[districtFilter] && (
              <select 
                value={blockFilter} 
                onChange={e => setBlockFilter(e.target.value)}
                className="border border-white/10 rounded-xl px-4 py-3 shadow-sm text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none w-full md:w-36 form-select bg-slate-800/50 backdrop-blur-sm font-medium text-slate-200"
              >
                <option value="">All Blocks</option>
                {blocksByDistrict[districtFilter].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            )}
            <input 
              type="text" 
              placeholder="Search name or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 md:w-64 border border-slate-700 hover:border-teal-500/50 rounded-xl px-5 py-3 shadow-sm text-white focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium placeholder:text-slate-500 bg-slate-800/80 backdrop-blur-sm"
            />
            <button onClick={handleCreateNew} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-900 px-5 py-3 rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(20,184,166,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Create Record
            </button>
          </>
        } 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-900/40 border-b border-slate-800 shrink-0 relative z-10">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <div>
            <div className="text-3xl font-black text-white leading-none">{totalEntities}</div>
            <div className="text-xs font-bold text-teal-400/80 uppercase tracking-widest mt-1">Total Entities</div>
          </div>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <div>
            <div className="text-3xl font-black text-white leading-none">{pendingVerifications}</div>
            <div className="text-xs font-bold text-amber-400/80 uppercase tracking-widest mt-1">Pending Verification</div>
          </div>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-700/50 text-slate-400 border border-slate-600/50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
          </div>
          <div>
            <div className="text-3xl font-black text-white leading-none">{hiddenRecords}</div>
            <div className="text-xs font-bold text-slate-400/80 uppercase tracking-widest mt-1">Hidden Records</div>
          </div>
        </div>
      </div>
      
      {/* Action Bar for Bulk Selection */}
      {selectedIds.length > 0 && (
        <div className="px-6 py-4 bg-teal-900/30 border-b border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 backdrop-blur-md">
          <div className="text-sm font-bold text-teal-400">{selectedIds.length} listings selected</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExportCSV} className="text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 hover:text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm">Export Selected CSV</button>
            <div className="w-px h-6 bg-slate-700 hidden md:block mx-1"></div>
            <button onClick={() => handleBulkUpdate('verified', true)} disabled={isBulking} className="text-xs bg-slate-800 text-teal-400 border border-teal-500/30 hover:bg-teal-500/20 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm">Verify</button>
            <button onClick={() => handleBulkUpdate('verified', false)} disabled={isBulking} className="text-xs bg-slate-800 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm">Unverify</button>
            <button onClick={() => handleBulkUpdate('isPublished', true)} disabled={isBulking} className="text-xs bg-slate-800 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm">Publish</button>
            <button onClick={() => handleBulkUpdate('isPublished', false)} disabled={isBulking} className="text-xs bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm">Unpublish</button>
            <div className="w-px h-6 bg-slate-700 hidden md:block mx-1"></div>
            <button onClick={handleBulkDelete} disabled={isDeletingBulk} className="text-xs bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm">Delete Selected</button>
          </div>
        </div>
      )}

      {/* Dynamic Self-Learning Category Filters */}
      {uniqueCategories.length > 0 && (
        <div className="px-6 py-3 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800 flex flex-wrap items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Filter by Type:</span>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)} 
              className="text-xs border border-slate-700 rounded-lg px-3 py-1.5 bg-slate-800 font-bold text-teal-400 outline-none focus:border-teal-500 shadow-sm"
            >
              <option value="">All Entities</option>
              {uniqueCategories.map((cat) => (
                <option key={cat as string} value={cat as string}>{cat as string}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 shrink-0 border-l border-slate-700 pl-4 ml-auto">
            <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)} className="text-xs border border-slate-700 rounded-lg px-2 py-1.5 bg-slate-800 font-medium text-slate-300 outline-none focus:border-teal-500">
              <option value="all">Verification: All</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="text-xs border border-slate-700 rounded-lg px-2 py-1.5 bg-slate-800 font-medium text-slate-300 outline-none focus:border-teal-500">
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="recent_update">Sort: Recently Updated</option>
              <option value="alpha">Sort: Alphabetical</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-[#0B1121] relative z-10">
        
        {/* Mobile Select All Bar */}
        <div className="md:hidden px-4 py-3 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center sticky top-0 z-20 backdrop-blur-md">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filteredData.length > 0 && selectedIds.length === filteredData.length} 
              onChange={handleSelectAll} 
              className="w-5 h-5 text-teal-500 rounded border-slate-600 bg-slate-900 focus:ring-teal-500" 
            />
            <span className="text-sm font-bold text-slate-300">
              {selectedIds.length === filteredData.length && filteredData.length > 0 ? "Deselect All" : "Select All"}
            </span>
          </label>
          <span className="text-xs font-medium text-slate-500">{filteredData.length} items</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 font-medium">No records found.</div>
        ) : (
          <table className="w-full text-left border-collapse block md:table">
            <thead className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm border-b border-slate-800 hidden md:table-header-group">
              <tr>
                <th className="px-6 py-4 flex items-center gap-2">
                  <input type="checkbox" checked={filteredData.length > 0 && selectedIds.length === filteredData.length} onChange={handleSelectAll} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-800 focus:ring-teal-500 cursor-pointer" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Select All</span>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Image</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Entity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-transparent md:divide-slate-800 p-3 md:p-0">
              {filteredData.map(item => (
                <tr key={item.id} className="block md:table-row bg-slate-800/80 md:bg-transparent mb-3 md:mb-0 border border-slate-700 md:border-none shadow-sm md:shadow-none p-4 md:p-0 rounded-2xl md:rounded-none hover:bg-slate-800/40 transition-colors group">
                  <td className="hidden md:table-cell px-6 py-4"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-800 focus:ring-teal-500" /></td>
                  <td className="block md:table-cell px-0 md:px-6 py-0 md:py-4">
                    <div className="flex justify-between items-start md:block">
                      <div className="flex items-center gap-3 md:contents">
                        <div className="md:hidden pt-1">
                           <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-800 focus:ring-teal-500" />
                        </div>
                        <div className="w-12 h-12 md:hidden rounded-xl bg-slate-800 p-0.5 shadow-sm border border-slate-700 overflow-hidden shrink-0">
                          {item.image ? (
                             <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                             <div className="w-full h-full rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-500">
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                             </div>
                          )}
                        </div>
                        <div className="flex-1 md:hidden">
                          <div className="font-bold text-sm text-white drop-shadow-sm flex items-center gap-2 flex-wrap">
                            {item.name}
                            {item.isPublished === false && <span className="bg-slate-700 text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-slate-600">Hidden</span>}
                          </div>
                          <div className="text-[10px] font-semibold text-teal-400 mt-0.5 uppercase tracking-wider">{item.category}</div>
                          
                          <div className="mt-2 text-xs text-slate-400 space-y-1">
                            <div className="flex items-center gap-1.5 font-medium"><svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> {item.phone || "N/A"}</div>
                            <div className="text-[10px] text-slate-500 truncate" title={item.city}>{item.city}, {item.district}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    {item.image ? (
                      <div className="w-12 h-12 rounded-xl bg-slate-800 p-0.5 shadow-sm border border-slate-700 overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-slate-500 shadow-inner">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="font-bold text-sm text-white drop-shadow-sm flex items-center gap-2">
                      {item.name}
                      {item.isPublished === false && <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-slate-600">Hidden</span>}
                    </div>
                    <div className="text-xs font-semibold text-teal-400 mt-0.5 uppercase tracking-wider">{item.category}</div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="text-sm font-medium text-slate-300 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> {item.phone || "N/A"}</div>
                    <div className="text-[10px] text-slate-500 mt-1 max-w-[200px] truncate" title={item.city}>{item.city}, {item.district}</div>
                  </td>
                  <td className="block md:table-cell px-0 md:px-6 pt-3 md:py-4 mt-3 md:mt-0 border-t border-slate-700 md:border-none">
                    <div className="flex items-center justify-between md:justify-start">
                      {item.verified ? (
                        <span className="flex w-max items-center gap-1.5 text-teal-400 font-bold text-[9px] md:text-[10px] uppercase tracking-widest bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 rounded-md shadow-sm">
                          <svg className="w-3 h-3 text-teal-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                          Verified
                        </span>
                      ) : (
                        <span className="flex w-max items-center gap-1.5 text-amber-400 font-bold text-[9px] md:text-[10px] uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md shadow-sm">
                          Unverified
                        </span>
                      )}
                      
                      <div className="md:hidden flex items-center gap-2">
                        <Link href={generateUniversalSeoUrl(item, item.category?.toLowerCase() + 's' as any) || `/doctors/${item.customSlug || item.id}`} target="_blank" className="text-slate-400 hover:text-white font-bold text-[9px] uppercase tracking-widest flex items-center justify-center bg-slate-800 border border-slate-700 w-8 h-8 rounded-lg shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </Link>
                        <button onClick={() => openDrawer(item)} className="bg-gradient-to-r from-teal-500 to-teal-600 text-slate-900 font-bold text-[9px] uppercase tracking-widest px-3 py-1.5 h-8 rounded-lg shadow-sm flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          Edit
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={generateUniversalSeoUrl(item, item.category?.toLowerCase() + 's' as any) || `/doctors/${item.customSlug || item.id}`} target="_blank" className="text-slate-400 hover:text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 bg-slate-800 border border-slate-700 px-2 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        View Live
                      </Link>
                      <button onClick={() => openDrawer(item)} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-900 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-[0_2px_10px_rgba(20,184,166,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        Edit Data
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isDrawerOpen && selectedListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-end">
          <div className="bg-[#0B1121] border-l border-slate-800 w-full max-w-4xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-indigo-500/5 to-transparent pointer-events-none z-0"></div>
            
            <div className="p-6 border-b border-slate-800/60 flex justify-between items-center shrink-0 bg-slate-900/80 backdrop-blur-xl shadow-md z-10 relative">
              <h3 className="font-bold text-2xl font-serif text-white drop-shadow-md">{isNewListing ? "New Record" : selectedListing.name}</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            {/* TABS HEADER */}
            <div className="flex border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-8 pt-4 gap-6 shrink-0 overflow-x-auto no-scrollbar relative z-10">
              <button 
                onClick={() => setActiveTab('basic')}
                className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'basic' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Basic Info
              </button>
              <button 
                onClick={() => setActiveTab('locations')}
                className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'locations' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Locations & Clinics
              </button>
              <button 
                onClick={() => setActiveTab('plugins')}
                className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'plugins' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Plugins & Add-ons
              </button>
              {selectedListing.category && directoryConfig[selectedListing.category]?.tabs?.filter(t => t.id !== 'basic').map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
              
              {activeTab === 'basic' && (
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 flex items-start gap-8 bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 shadow-sm">
                    <div className="w-32 h-32 rounded-2xl bg-slate-900/50 flex items-center justify-center border-2 border-dashed border-slate-600 overflow-hidden shrink-0 relative">
                      {selectedListing.image ? (
                        <img src={selectedListing.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      )}
                      {isUploadingImage && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center"><svg className="animate-spin w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>}
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-bold text-slate-300 block mb-1">Profile Image</label>
                      <p className="text-xs text-slate-500 mb-3">Upload a high quality square image. Maximum 2MB.</p>
                      <div className="flex gap-3">
                        <label className="px-5 py-2.5 bg-slate-800 border-2 border-slate-700 hover:border-teal-500 rounded-xl text-sm font-bold text-slate-300 cursor-pointer transition-colors shadow-sm inline-block">
                          {isUploadingImage ? 'Uploading...' : 'Upload / Edit Image'}
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                        </label>
                        {selectedListing.image && (
                          <button onClick={() => setSelectedListing({...selectedListing, image: null})} className="px-5 py-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl text-sm font-bold transition-colors">
                            Remove Primary
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedListing.rawImages && selectedListing.rawImages.length > 0 && (
                    <div className="col-span-2 bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-sm mt-4">
                      <h4 className="font-bold text-white mb-2">Scraped Images (Crawler)</h4>
                      <p className="text-xs text-slate-400 mb-4">Click any image to crop it and set as Primary or add to Gallery.</p>
                      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {selectedListing.rawImages.map((rawUrl: string, idx: number) => {
                          const proxiedUrl = rawUrl.includes('places.googleapis.com') ? `/api/image-proxy?url=${encodeURIComponent(rawUrl)}` : rawUrl;
                          return (
                            <div key={idx} onClick={() => handleRawImageClick(rawUrl)} className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border-2 border-slate-700 hover:border-teal-500 cursor-pointer shadow-sm transition-all hover:scale-105">
                              <Image src={proxiedUrl} alt={`Scraped ${idx}`} fill sizes="96px" className="object-cover" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedListing.galleryImages && selectedListing.galleryImages.length > 0 && (
                    <div className="col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm mt-4">
                      <h4 className="font-bold text-slate-900 mb-4">Gallery Images</h4>
                      <div className="flex flex-wrap gap-4">
                        {selectedListing.galleryImages.map((galUrl: string, idx: number) => (
                          <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
                            <img src={galUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  const newGal = [...selectedListing.galleryImages];
                                  newGal.splice(idx, 1);
                                  setSelectedListing({...selectedListing, galleryImages: newGal});
                                }}
                                className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-lg"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="form-label-dark">Name</label>
                    <input type="text" value={selectedListing.name || ""} onChange={e => setSelectedListing({...selectedListing, name: e.target.value})} className="form-input-dark" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Assigned Owner Email</label>
                      {selectedListing.verified && selectedListing.ownerEmail === selectedListing.assignedOwnerEmail && selectedListing.assignedOwnerEmail ? (
                        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Verified</span>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={selectedListing.assignedOwnerEmail || ""} onChange={e => setSelectedListing({...selectedListing, assignedOwnerEmail: e.target.value})} className="form-input-dark flex-1 m-0" placeholder="e.g. user@example.com" />
                      <button onClick={handleInstantVerify} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap shadow-[0_4px_15px_rgba(13,148,136,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Verify</button>
                    </div>
                  </div>
                  <div className="relative flex flex-col justify-end">
                    <button 
                      onClick={generateMagicLink}
                      className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-4 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm group"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                      Copy Magic Invite Link
                    </button>
                    <p className="text-[10px] text-slate-500 mt-2 text-center">Ghost Onboarding: Send link via WhatsApp to auto-assign profile.</p>
                  </div>
                  <div className="relative">
                    <label className="form-label-dark">Custom Slug</label>
                    <div className="flex gap-2">
                      <input type="text" value={selectedListing.customSlug || ""} onChange={e => setSelectedListing({...selectedListing, customSlug: e.target.value.trim()})} className="form-input-dark" />
                      <button onClick={checkSlugAvailability} className="bg-slate-800 text-white px-4 py-1 rounded-lg text-sm font-bold">Check</button>
                      <button onClick={() => setIsSlugModalOpen(true)} className="bg-teal-600 text-white px-4 py-1 rounded-lg text-sm font-bold whitespace-nowrap">Super Search</button>
                    </div>
                  </div>
                  
                  {/* Vault Storage Metrics (Read-only) */}
                  <div className="col-span-1 md:col-span-2 bg-slate-900/50 border border-white/5 rounded-xl p-5 shadow-inner flex flex-wrap gap-8 items-center backdrop-blur-md">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Vault Storage Usage</div>
                      <div className="text-2xl font-black text-slate-200 flex items-end gap-2">
                        {selectedListing.vaultFilesStored || 0} <span className="text-sm font-medium text-slate-400 mb-1">Files</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Vault Network Forwards</div>
                      <div className="text-2xl font-black text-slate-200 flex items-end gap-2">
                        {selectedListing.vaultFilesSent || 0} <span className="text-sm font-medium text-slate-400 mb-1">Sent</span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-3 py-1.5 rounded-lg border border-amber-500/30">
                        Tiered Billing Data
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="form-label-dark">Phone</label>
                    <input type="text" value={selectedListing.phone || ""} onChange={e => setSelectedListing({...selectedListing, phone: e.target.value})} className="form-input-dark" />
                  </div>
                  <div>
                    <label className="form-label-dark">Category</label>
                    <input 
                      type="text" 
                      list="categoriesList"
                      value={selectedListing.category || ""} 
                      onChange={e => setSelectedListing({...selectedListing, category: e.target.value})} 
                      className="form-input-dark" 
                      placeholder="Type or select a category"
                    />
                    <datalist id="categoriesList">
                      {uniqueCategories.map((cat: any) => (
                        <option key={cat} value={cat} />
                      ))}
                      <option value="Doctor" />
                      <option value="Hospital" />
                      <option value="Pharmacy" />
                      <option value="Lab" />
                      <option value="Ambulance" />
                      <option value="Clinic" />
                    </datalist>
                  </div>
                  <div>
                    <label className="form-label-dark">Sub-Category / Specialty</label>
                    <input type="text" value={selectedListing.subCategory || ""} onChange={e => setSelectedListing({...selectedListing, subCategory: e.target.value})} className="form-input-dark" />
                  </div>
                  {selectedListing.category === 'Doctor' && (
                    <>
                      <div>
                        <label className="form-label-dark">Primary Specialty</label>
                        <input type="text" value={selectedListing.primarySpecialty || ""} onChange={e => setSelectedListing({...selectedListing, primarySpecialty: e.target.value})} className="form-input-dark" />
                      </div>
                      <div>
                        <label className="form-label-dark">Doctor Tier</label>
                        <select value={selectedListing.doctorTier || ""} onChange={e => setSelectedListing({...selectedListing, doctorTier: e.target.value})} className="form-input-dark">
                          <option value="">Select Tier</option>
                          <option value="Ayush">Ayush</option>
                          <option value="MBBS">MBBS</option>
                          <option value="Specialist">Specialist</option>
                          <option value="Super Specialist">Super Specialist</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-800/40 p-6 rounded-2xl border border-white/10 mt-2">
                    <div>
                      <label className="form-label text-slate-300">Standard Consultation Fee</label>
                      <input type="number" value={selectedListing.consultationFee || ""} onChange={e => setSelectedListing({...selectedListing, consultationFee: e.target.value})} placeholder="e.g. 800" className="form-input-dark" />
                    </div>
                    <div>
                      <label className="form-label text-emerald-600">Launch Offer Fee (Discount)</label>
                      <input type="number" value={selectedListing.launchFee || ""} onChange={e => setSelectedListing({...selectedListing, launchFee: e.target.value})} placeholder="e.g. 500" className="form-input-dark !bg-emerald-900/20 !border-emerald-700/50 !text-emerald-400 focus:!border-emerald-500" />
                    </div>
                  </div>
                  <div className="col-span-2 mt-4">
                    <label className="form-label-dark">About / Biography</label>
                    <textarea value={selectedListing.about || ""} onChange={e => setSelectedListing({...selectedListing, about: e.target.value})} className="form-input-dark" rows={4} />
                  </div>
                  <div className="col-span-2 mt-4">
                    <label className="form-label-dark">YouTube Video Links (Media Gallery)</label>
                    <InlineEditArray 
                      items={selectedListing.youtubeLinks || []} 
                      onSave={(newItems) => setSelectedListing({...selectedListing, youtubeLinks: newItems})} 
                      isEditMode={true}
                      placeholder="Paste YouTube URL here..." 
                    />
                  </div>
                  
                  {selectedListing.category && directoryConfig[selectedListing.category]?.tabs?.find(t => t.id === 'basic')?.fields && (
                    <div className="col-span-2 bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-sm mt-4">
                      <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">{selectedListing.category} Specific Basic Info</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {directoryConfig[selectedListing.category].tabs.find(t => t.id === 'basic')?.fields.map(field => (
                          <div key={field.key} className={field.type === 'textarea' ? "col-span-3" : ""}>
                            <label className="form-label-dark">{field.label}</label>
                            {field.type === 'textarea' ? (
                                <textarea 
                                  className="form-input-dark" 
                                  value={selectedListing[field.key] || ''} 
                                  onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.value})} 
                                  placeholder={field.placeholder}
                                />
                            ) : field.type === 'boolean' ? (
                                <label className="flex items-center gap-3 mt-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                                    checked={selectedListing[field.key] || false} 
                                    onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.checked})} 
                                  />
                                  <span className="text-sm font-bold text-slate-300">{field.label}</span>
                                </label>
                            ) : field.type === 'select' ? (
                                <select 
                                  className="form-select-dark" 
                                  value={selectedListing[field.key] || ''} 
                                  onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.value})}
                                >
                                    <option value="">Select {field.label}</option>
                                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : (
                                <input 
                                  type="text" 
                                  className="form-input-dark" 
                                  value={selectedListing[field.key] || ''} 
                                  onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.value})} 
                                  placeholder={field.placeholder}
                                />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="col-span-2 flex flex-wrap items-center gap-6 mt-2 p-5 bg-slate-800/40 border border-slate-700 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" id="verifiedCheck" checked={selectedListing.verified || false} onChange={e => setSelectedListing({...selectedListing, verified: e.target.checked})} className="w-6 h-6 text-teal-500 rounded border-slate-600 bg-slate-900 focus:ring-teal-500/20" />
                      <span className="text-sm font-bold text-white">Verified Listing</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" id="featuredCheck" checked={selectedListing.featured || false} onChange={e => setSelectedListing({...selectedListing, featured: e.target.checked})} className="w-6 h-6 text-amber-500 rounded border-slate-600 bg-slate-900 focus:ring-amber-500/20" />
                      <span className="text-sm font-bold text-white">Featured / Sponsored</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" id="testCheck" checked={selectedListing.isTestAccount || false} onChange={e => setSelectedListing({...selectedListing, isTestAccount: e.target.checked})} className="w-6 h-6 text-indigo-500 rounded border-slate-600 bg-slate-900 focus:ring-indigo-500/20" />
                      <span className="text-sm font-bold text-indigo-400">Test Account (Bypass Pay)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer ml-auto border-l border-slate-700 pl-6">
                      <div className={`relative inline-block w-12 h-6 rounded-full transition-colors ${selectedListing.isPublished !== false ? 'bg-teal-500' : 'bg-slate-700'}`}>
                        <input type="checkbox" className="absolute opacity-0 w-0 h-0" checked={selectedListing.isPublished !== false} onChange={e => setSelectedListing({...selectedListing, isPublished: e.target.checked})} />
                        <span className={`absolute cursor-pointer top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${selectedListing.isPublished !== false ? 'transform translate-x-6' : ''}`}></span>
                      </div>
                      <span className="text-sm font-bold text-white">{selectedListing.isPublished !== false ? 'Public (Visible)' : 'Hidden (Draft)'}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer ml-auto border-l border-slate-300 pl-6">
                      <div className={`relative inline-block w-12 h-6 rounded-full transition-colors ${selectedListing.adminLocked ? 'bg-rose-500' : 'bg-slate-300'}`}>
                        <input type="checkbox" className="absolute opacity-0 w-0 h-0" checked={selectedListing.adminLocked || false} onChange={e => {
                          const isLocked = e.target.checked;
                          setSelectedListing({
                            ...selectedListing, 
                            adminLocked: isLocked,
                            isPublished: isLocked ? false : selectedListing.isPublished
                          });
                        }} />
                        <span className={`absolute cursor-pointer top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${selectedListing.adminLocked ? 'transform translate-x-6' : ''}`}></span>
                      </div>
                      <span className="text-sm font-bold text-rose-600">System Lock</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'locations' && (
                <div className="space-y-8">
                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-sm">
                    <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Primary Address & Location Mapping</h4>
                    
                    <div className="mb-6">
                      <label className="form-label-dark">Primary Clinic / Hospital Name</label>
                      <input 
                        type="text" 
                        value={selectedListing.clinicName || ""} 
                        onChange={e => setSelectedListing({...selectedListing, clinicName: e.target.value})} 
                        className="form-input-dark" 
                        placeholder="e.g. Sanjivani Hospital"
                      />
                    </div>

                    <AddressBlock 
                      data={{
                        country: selectedListing.country || '',
                        state: selectedListing.state || '',
                        district: selectedListing.district || '',
                        block: selectedListing.block || '',
                        city: selectedListing.city || '',
                        pincode: selectedListing.pin || '',
                        localAddress: selectedListing.locality || selectedListing.address || ''
                      }}
                      onChange={(newData) => setSelectedListing({
                        ...selectedListing,
                        country: newData.country,
                        state: newData.state,
                        district: newData.district,
                        block: newData.block,
                        city: newData.city,
                        pin: newData.pincode,
                        locality: newData.localAddress,
                        address: newData.localAddress
                      })}
                    />
                  </div>

                  {selectedListing.category === 'Doctor' && (
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-sm">
                      <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-widest">Associated Clinics / Hospitals</h4>
                      <p className="text-xs text-slate-400 mb-4">Edit the clinics or hospitals where this entity provides services.</p>
                      <ObjectArrayEditor
                        title="Clinics"
                        items={locations}
                        fields={[
                          { key: "clinicName", label: "Clinic/Hospital Name", type: "text" },
                          { key: "address", label: "Full Address", type: "textarea" },
                          { key: "mapUrl", label: "Google Maps Embed URL", type: "text" },
                          { key: "timings", label: "Timings (e.g. Mon-Sat 10AM-5PM)", type: "text" },
                          { key: "phone", label: "Booking Phone Number", type: "text" }
                        ]}
                        onUpdate={(idx, key, val) => handleArrayChange(setLocations, locations, idx, key, val)}
                        onAdd={() => setLocations([...locations, { clinicName: '', address: '', mapUrl: '', timings: '', phone: '' }])}
                        onRemove={(idx) => setLocations(locations.filter((_, i) => i !== idx))}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'plugins' && (
                <div className="space-y-8">
                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-sm">
                    <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-widest">Active Plugins & Capabilities</h4>
                    <p className="text-xs text-slate-400 mb-6">Manage the OS features this provider has access to. Adding a plugin instantly unlocks features in their portal and public profile.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(selectedListing.role === 'hospital' ? [
                        { id: 'plugin_hospital_bed_manager', name: 'Live Bed Manager Pro', icon: '🛏️' },
                        { id: 'plugin_hospital_ambulance', name: 'SOS Ambulance Dispatcher', icon: '🚑' },
                        { id: 'plugin_hospital_roster', name: 'B2B Doctor Roster Network', icon: '🤝' }
                      ] : [
                        { id: 'plugin_booking_physical', name: 'Physical Appointments', icon: '🏥' },
                        { id: 'plugin_telemedicine_scheduled', name: 'Scheduled Telemedicine', icon: '🩺' },
                        { id: 'plugin_telemedicine_urgent', name: 'Urgent Video Call', icon: '🎥' },
                        { id: 'plugin_vip_rx_pad', name: 'VIP Digital Rx Pad (+AI)', icon: '🧠' }
                      ]).map(plugin => {
                        const activePlugins = selectedListing.activePlugins || [];
                        const isActive = activePlugins.includes(plugin.id);
                        
                        return (
                          <div key={plugin.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${isActive ? 'bg-amber-900/20 border-amber-500/50' : 'bg-slate-800/80 border-slate-700'}`}>
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{plugin.icon}</span>
                              <span className={`font-bold text-sm ${isActive ? 'text-amber-400' : 'text-slate-300'}`}>{plugin.name}</span>
                            </div>
                            <label className="relative inline-block w-12 h-6 rounded-full transition-colors cursor-pointer" style={{ backgroundColor: isActive ? '#f59e0b' : '#334155' }}>
                              <input 
                                type="checkbox" 
                                className="absolute opacity-0 w-0 h-0" 
                                checked={isActive} 
                                onChange={(e) => {
                                  let newPlugins = [...activePlugins];
                                  if (e.target.checked) {
                                    newPlugins.push(plugin.id);
                                  } else {
                                    newPlugins = newPlugins.filter(id => id !== plugin.id);
                                  }
                                  setSelectedListing({ ...selectedListing, activePlugins: newPlugins });
                                }} 
                              />
                              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'transform translate-x-6' : ''}`}></span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab !== 'basic' && activeTab !== 'locations' && activeTab !== 'plugins' && (
                <div className="space-y-8">
                  {selectedListing.category && directoryConfig[selectedListing.category]?.tabs?.find(t => t.id === activeTab)?.fields?.map(field => (
                    <div key={field.key} className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-sm">
                      {field.type === 'object_array' && field.arrayFields ? (
                        <ObjectArrayEditor
                          title={field.label}
                          items={selectedListing[field.key] || []}
                          fields={field.arrayFields}
                          onUpdate={(idx, k, val) => {
                            const newArr = [...(selectedListing[field.key] || [])];
                            newArr[idx] = { ...newArr[idx], [k]: val };
                            setSelectedListing({...selectedListing, [field.key]: newArr});
                          }}
                          onAdd={() => {
                            const emptyObj: any = {};
                            field.arrayFields?.forEach(af => emptyObj[af.key] = '');
                            setSelectedListing({...selectedListing, [field.key]: [...(selectedListing[field.key] || []), emptyObj]});
                          }}
                          onRemove={(idx) => {
                            const newArr = [...(selectedListing[field.key] || [])];
                            newArr.splice(idx, 1);
                            setSelectedListing({...selectedListing, [field.key]: newArr});
                          }}
                        />
                      ) : field.type === 'string_array' ? (
                        <>
                          <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-widest">{field.label}</h4>
                          <InlineEditArray 
                            items={selectedListing[field.key] || []} 
                            onSave={(newItems) => setSelectedListing({...selectedListing, [field.key]: newItems})} 
                            isEditMode={true}
                            placeholder={field.placeholder || "Add item..."} 
                          />
                        </>
                      ) : (
                        <div className={field.type === 'textarea' ? "col-span-2" : ""}>
                          <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-widest">{field.label}</h4>
                          {field.type === 'textarea' ? (
                              <textarea 
                                className="form-input-dark" 
                                value={selectedListing[field.key] || ''} 
                                onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.value})} 
                                placeholder={field.placeholder}
                              />
                          ) : field.type === 'boolean' ? (
                              <label className="flex items-center gap-3 mt-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="w-5 h-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                                  checked={selectedListing[field.key] || false} 
                                  onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.checked})} 
                                />
                                <span className="text-sm font-bold text-slate-300">{field.label}</span>
                              </label>
                          ) : field.type === 'select' ? (
                              <select 
                                className="form-select-dark" 
                                value={selectedListing[field.key] || ''} 
                                onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.value})}
                              >
                                  <option value="">Select {field.label}</option>
                                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                          ) : (
                              <input 
                                type="text" 
                                className="form-input-dark" 
                                value={selectedListing[field.key] || ''} 
                                onChange={e => setSelectedListing({...selectedListing, [field.key]: e.target.value})} 
                                placeholder={field.placeholder}
                              />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {(!selectedListing.category || !directoryConfig[selectedListing.category] || !directoryConfig[selectedListing.category]?.tabs?.find(t => t.id === activeTab)) && (
                    <div className="bg-slate-800/40 border-2 border-dashed border-white/10 p-8 rounded-2xl text-center">
                      <p className="text-slate-400 font-medium">Select a category in Basic Info to unlock specific {activeTab} settings.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end gap-4 shrink-0 bg-slate-900/80 backdrop-blur-xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] z-10">
              <button onClick={() => setIsDrawerOpen(false)} disabled={isSaving} className="px-8 py-3.5 border border-slate-700 hover:border-slate-500 bg-slate-800 font-bold rounded-xl text-slate-300 transition-all hover:bg-slate-700 hover:text-white">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="px-8 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-teal-500/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <PremiumSlugModal 
        isOpen={isSlugModalOpen} 
        onClose={() => setIsSlugModalOpen(false)} 
        currentName={selectedListing?.name || "Dr. Example"}
        currentUglyUrl={`dehapa.com/india/odisha/category/${selectedListing?.id || "temporary-id-12345"}`}
      />

      {(imageFileToCrop || imageUrlToCrop) && (
        <ImageCropper
          imageFile={imageFileToCrop}
          imageUrl={imageUrlToCrop}
          onCancel={() => { setImageFileToCrop(null); setImageUrlToCrop(null); }}
          onCropComplete={handleCroppedImage}
        />
      )}
    </AdminCard>
  );
}
