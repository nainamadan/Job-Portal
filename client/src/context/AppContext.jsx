import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { jobsData as staticJobsData } from "../assets/assets";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [jobs, setJobs] = useState([]);

  const [searchFilter, setSearchFilter] = useState({
    title: "",
    location: "",
  });

  const [isSearched, setIsSearched] = useState(false);
  const [showRecriterLogin, setShowRecriterLogin] = useState(false);
  const [companyToken, setCompanyToken] = useState(
    localStorage.getItem("companyToken") || null
  );
  const [companyData, setCompanyData] = useState(null);

  // Fetch all jobs from backend
  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs`);
      if (data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
        setJobs(data.jobs);
      } else {
        // Fallback to static jobs if API returns empty array
        setJobs(staticJobsData);
      }
    } catch (error) {
      console.error("Fetch Jobs Error:", error);
      // Use static fallback on error
      setJobs(staticJobsData);
    }
  };

  // Fetch company profile data
  const fetchCompanyData = async () => {
    if (!companyToken) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/company/company`, {
        headers: { token: companyToken },
      });
      if (data.success) {
        setCompanyData(data.company);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch Company Data Error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("companyToken");
        localStorage.removeItem("isRecruiterLoggedIn");
        setCompanyToken(null);
        setCompanyData(null);
      }
    }
  };

  // Run on app load
  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch company data whenever companyToken changes
  useEffect(() => {
    if (companyToken) {
      fetchCompanyData();
    } else {
      setCompanyData(null);
    }
  }, [companyToken]);

  const value = {
    jobs,
    setJobs,
    fetchJobs,
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,
    showRecriterLogin,
    setShowRecriterLogin,
    companyToken,
    setCompanyToken,
    companyData,
    setCompanyData,
    fetchCompanyData,
    backendUrl,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};