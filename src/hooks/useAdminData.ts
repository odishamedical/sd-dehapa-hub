import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useAdminData() {
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
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (search && !item.name?.toLowerCase().includes(search.toLowerCase()) && !item.phone?.includes(search)) return false;
      if (categoryFilter && item.category !== categoryFilter) return false;
      if (verifiedFilter !== "all") {
        if (verifiedFilter === "verified" && !item.verified) return false;
        if (verifiedFilter === "unverified" && item.verified) return false;
      }
      if (countryFilter && item.country && item.country !== countryFilter) return false;
      if (stateFilter && item.state !== stateFilter) return false;
      if (districtFilter && item.district !== districtFilter) return false;
      if (blockFilter && item.city !== blockFilter && item.block !== blockFilter) return false; 
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
  }, [data, search, categoryFilter, verifiedFilter, sortOption, countryFilter, stateFilter, districtFilter, blockFilter]);

  const uniqueCategories = Array.from(new Set(['Doctor', 'Hospital', 'Pharmacy', 'Lab', 'Ambulance', ...data.map(d => d.category).filter(Boolean)]));
  
  const stats = {
    totalEntities: data.length,
    pendingVerifications: data.filter(d => !d.verified).length,
    hiddenRecords: data.filter(d => d.isPublished === false).length
  };

  return {
    data,
    loading,
    filteredData,
    uniqueCategories,
    stats,
    fetchData,
    filters: {
      search, setSearch,
      categoryFilter, setCategoryFilter,
      verifiedFilter, setVerifiedFilter,
      sortOption, setSortOption,
      countryFilter, setCountryFilter,
      stateFilter, setStateFilter,
      districtFilter, setDistrictFilter,
      blockFilter, setBlockFilter
    }
  };
}
