import { createContext, useState, useEffect } from "react";
import { jobsData as staticJobsData } from "../assets/assets";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

  const [jobs, setJobs] = useState([]);

  const [searchFilter, setSearchFilter] = useState({
    title: "",
    location: "",
  });

  const [isSearched, setIsSearched] = useState(false);

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
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};