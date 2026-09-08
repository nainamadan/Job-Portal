import { createContext, useState, useEffect } from "react";
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
const [companyToken, setCompanyToken] = useState(null);
const[companyData, setCompanyData] = useState(null);
  // ✅ fetch jobs function (future API ready)
  const fetchJobs = () => {
    setJobs(staticJobsData);
  };

  // ✅ run on app load
  useEffect(() => {
    fetchJobs();
  }, []);

  const value = {
    jobs,
    setJobs,
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
    backendUrl,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};