// import React, { useContext, useState, useEffect  } from "react";
// import { AppContext } from "../context/AppContext";
// import JobCard from "./JobCard";
// import { assets, JobCategories, JobLocations } from "../assets/assets";

// const JobListing = () => {
//   const {
//     jobs,
//     searchFilter,
//     setSearchFilter,
//     setIsSearched,
//   } = useContext(AppContext);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [showFilters, setShowFilters] = useState(false);
// const [selectedCategories, setSelectedCategories] = useState([]);
// const [selectedLocations, setSelectedLocations] = useState([]);
//   const jobsPerPage = 6;

//   const lastIndex = currentPage * jobsPerPage;
//   const firstIndex = lastIndex - jobsPerPage;
// const filteredJobs = jobs.filter((job) => {

//   const matchTitle =
//     searchFilter.title === "" ||
//     job.title
//       .toLowerCase()
//       .includes(searchFilter.title.toLowerCase());

//   const matchLocationSearch =
//     searchFilter.location === "" ||
//     job.location
//       .toLowerCase()
//       .includes(searchFilter.location.toLowerCase());

//   const matchCategory =
//     selectedCategories.length === 0 ||
//     selectedCategories.includes(job.category);

//   const matchLocationFilter =
//     selectedLocations.length === 0 ||
//     selectedLocations.includes(job.location);

//   return (
//     matchTitle &&
//     matchLocationSearch &&
//     matchCategory &&
//     matchLocationFilter
//   );
// });
// const currentJobs = filteredJobs.slice(firstIndex, lastIndex);
// const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);;

//   // const clearSearch = () => {
//   //   setSearchFilter({ title: "", location: "" });
//   //   setIsSearched(false);
//   // };
// useEffect(() => {
//   setCurrentPage(1);
// }, [
//   searchFilter,
//   selectedCategories,
//   selectedLocations,
// ]);
// const clearSearch = () => {
//   setSearchFilter({
//     title: "",
//     location: "",
//   });

//   setSelectedCategories([]);
//   setSelectedLocations([]);

//   setCurrentPage(1);
//   setIsSearched(false);
// };
//   return (

//     <div
//     id="job-listing"
//     className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-12 flex gap-10 relative">
//       {/* MOBILE FILTER BUTTON */}
//       <button
//         onClick={() => setShowFilters(true)}
//         className="md:hidden fixed bottom-5 right-5 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg z-50"
//       >
//         Filters
//       </button>

//       {/* OVERLAY */}
//       {showFilters && (
//         <div
//           onClick={() => setShowFilters(false)}
//           className="fixed inset-0 bg-black/40 z-40 md:hidden"
//         />
//       )}

//       {/* SIDEBAR */}
//       <div
//         className={`
//           fixed md:static top-0 left-0 h-full md:h-auto bg-white z-50 md:z-auto
//           w-72 p-5 md:p-0 shrink-0 md:-ml-6
//           transform transition-transform duration-300
//           ${showFilters ? "translate-x-0" : "-translate-x-full"}
//           md:translate-x-0
//         `}
//       >
//         {/* CLOSE */}
//         <div className="md:hidden flex justify-between items-center mb-5">
//           <h2 className="text-lg font-bold">Filters</h2>
//           <button onClick={() => setShowFilters(false)} className="text-2xl">
//             ✕
//           </button>
//         </div>

//         {/* CURRENT SEARCH */}
//       {(searchFilter.title || searchFilter.location) && (
//           <div className="mb-6">
//             <h3 className="font-semibold text-lg mb-3">
//               Current Search
//             </h3>

//             <div className="flex flex-wrap gap-3">
//               {searchFilter.title && (
//                 <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-full">
//                   <span>{searchFilter.title}</span>
//                   <img
//                     src={assets.cross_icon}
//                     className="w-3 cursor-pointer"
//                     onClick={clearSearch}
//                   />
//                 </div>
//               )}

//               {searchFilter.location && (
//                 <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-full">
//                   <span>{searchFilter.location}</span>
//                   <img
//                     src={assets.cross_icon}
//                     className="w-3 cursor-pointer"
//                     onClick={clearSearch}
//                   />
//                 </div>
//               )}
//             </div>
       
//           </div>
//         )}

//         {/* FILTER BUTTON */}
//         <div className="mb-6">
//           <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg font-medium">
//             Filters
//           </button>
//         </div>
// <button
//   onClick={clearSearch}
//   className="w-full mt-3 border border-red-300 text-red-600 hover:bg-red-50 py-2 rounded-lg font-medium transition"
// >
//   Clear Filters
// </button>
//         {/* CATEGORIES */}
//         <div className="mb-8">
//           <h3 className="font-semibold text-lg mb-4">
//             Search By Categories
//           </h3>

//           <ul className="space-y-3">
//             {JobCategories.map((item, i) => (
//               <li key={i} className="flex gap-3">
//                <input
//   type="checkbox"
//   checked={selectedCategories.includes(item)}
//   onChange={(e) => {

//     if (e.target.checked) {
//       setSelectedCategories(prev => [...prev, item]);
//     } else {
//       setSelectedCategories(prev =>
//         prev.filter(cat => cat !== item)
//       );
//     }

//     setCurrentPage(1);

//   }}
// />
//                 <span>{item}</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* LOCATIONS */}
//         <div>
//           <h3 className="font-semibold text-lg mb-4">
//             Search By Location
//           </h3>

//           <ul className="space-y-3">
//             {JobLocations.map((item, i) => (
//               <li key={i} className="flex gap-3">
//                 <input
//                   type="checkbox"
//                   checked={selectedLocations.includes(item)}
//                   onChange={(e) => {

//                     if (e.target.checked) {
//                       setSelectedLocations(prev => [...prev, item]);
//                     } else {
//                       setSelectedLocations(prev =>
//                         prev.filter(loc => loc !== item)
//                       );
//                     }

//                     setCurrentPage(1);

//                   }}
//                 />
//                 <span>{item}</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="flex-1 min-w-0">
//         <h2 className="text-3xl font-bold">Latest Jobs</h2>

//         <p className="text-gray-500 mt-2 mb-8">
//           Get your desired job from top companies.
//         </p>

//         {/* GRID */}
//        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

//   {currentJobs.length > 0 ? (

//     currentJobs.map((job) => (
//       <JobCard
//         key={job._id}
//         job={job}
//       />
//     ))

//   ) : (

//     <div className="col-span-3 py-20 text-center">

//       <h2 className="text-3xl font-bold">
//         No Jobs Found
//       </h2>

//       <p className="text-gray-500 mt-3">
//         Try another search or remove filters.
//       </p>

//     </div>

//   )}

// </div>

//         {/* PAGINATION */}
//         {totalPages > 1 && (
//   <div className="flex justify-center gap-2 mt-10">
//           <button
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage((prev) => prev - 1)}
//             className="px-4 py-2 border rounded disabled:opacity-50"
//           >
//             Prev
//           </button>

//           {[...Array(totalPages)].map((_, i) => (
//             <button
//               key={i}
//               onClick={() => setCurrentPage(i + 1)}
//               className={`px-4 py-2 border rounded ${
//                 currentPage === i + 1 ? "bg-blue-600 text-white" : ""
//               }`}
//             >
//               {i + 1}
//             </button>
//           ))}

//           <button
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage((prev) => prev + 1)}
//             className="px-4 py-2 border rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default JobListing;




import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import JobCard from "./JobCard";
import { JobCategories, JobLocations } from "../assets/assets";

const JobListing = () => {
  const {
    backendUrl,
    searchFilter,
    setSearchFilter,
    setIsSearched,
  } = useContext(AppContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Salary filter states
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [appliedSalaryRange, setAppliedSalaryRange] = useState({
    min: "",
    max: "",
  });
  const [salaryError, setSalaryError] = useState("");

  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [skills, setSkills] = useState("");
  const jobsPerPage = 6;

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setSearchError("");
      setFilteredJobs([]);
      setCurrentPage(1);
      try {
        const params = new URLSearchParams();
        if (searchFilter.title) params.set("title", searchFilter.title);
        if (searchFilter.location) params.set("location", searchFilter.location);
        selectedCategories.forEach((value) => params.append("categories", value));
        selectedLocations.forEach((value) => params.append("locations", value));
        if (selectedLevel) params.set("levels", selectedLevel);
        if (skills.trim()) params.set("skills", skills.trim());
        if (appliedSalaryRange.min !== "") params.set("minSalary", appliedSalaryRange.min);
        if (appliedSalaryRange.max !== "") params.set("maxSalary", appliedSalaryRange.max);
        const { data } = await axios.get(backendUrl + "/api/jobs", { params, signal: controller.signal });
        if (!data.success || !Array.isArray(data.jobs)) throw new Error(data.message || "Unable to load jobs.");
        if (!controller.signal.aborted) setFilteredJobs(data.jobs);
      } catch (error) {
        if (!controller.signal.aborted) setSearchError(error.response?.data?.message || error.message || "Unable to load jobs. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [backendUrl, searchFilter, selectedCategories, selectedLocations, selectedLevel, skills, appliedSalaryRange]);

  // Apply salary filter
  const handleSalarySearch = () => {
    const min = minSalary === "" ? "" : Number(minSalary);
    const max = maxSalary === "" ? "" : Number(maxSalary);

    if (
      (min !== "" && (!Number.isFinite(min) || min < 0)) ||
      (max !== "" && (!Number.isFinite(max) || max < 0))
    ) {
      setSalaryError("Please enter a valid salary.");
      return;
    }

    if (min !== "" && max !== "" && min > max) {
      setSalaryError("Minimum salary cannot be greater than maximum salary.");
      return;
    }

    setSalaryError("");
    setAppliedSalaryRange({ min, max });
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const lastIndex = currentPage * jobsPerPage;
  const firstIndex = lastIndex - jobsPerPage;
  const currentJobs = filteredJobs.slice(firstIndex, lastIndex);

  // Clear all filters
  const clearSearch = () => {
    setSearchFilter({
      title: "",
      location: "",
    });

    setSelectedLevel("");
    setSkills("");
    setSelectedCategories([]);
    setSelectedLocations([]);

    setMinSalary("");
    setMaxSalary("");
    setAppliedSalaryRange({ min: "", max: "" });
    setSalaryError("");

    setCurrentPage(1);
    setIsSearched(false);
  };

  const hasActiveSalaryFilter =
    appliedSalaryRange.min !== "" || appliedSalaryRange.max !== "";

  return (
    <div
      id="job-listing"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-12 flex gap-10 relative"
    >
      {/* MOBILE FILTER BUTTON */}
      <button
        onClick={() => setShowFilters(true)}
        className="md:hidden fixed bottom-5 right-5 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg z-50"
      >
        Filters
      </button>

      {/* OVERLAY */}
      {showFilters && (
        <div
          onClick={() => setShowFilters(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static top-0 left-0 h-full md:h-auto bg-white z-50 md:z-auto
          w-72 p-5 md:p-0 shrink-0 md:-ml-6 overflow-y-auto
          transform transition-transform duration-300
          ${showFilters ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* MOBILE CLOSE */}
        <div className="md:hidden flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">Filters</h2>
          <button
            onClick={() => setShowFilters(false)}
            className="text-2xl"
          >
            ✕
          </button>
        </div>

        {/* CURRENT SEARCH */}
        {(searchFilter.title ||
          searchFilter.location ||
          hasActiveSalaryFilter) && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">Current Search</h3>

            <div className="flex flex-wrap gap-2">
              {searchFilter.title && (
                <span className="bg-blue-100 px-3 py-2 rounded-full text-sm">
                  {searchFilter.title}
                </span>
              )}

              {searchFilter.location && (
                <span className="bg-blue-100 px-3 py-2 rounded-full text-sm">
                  {searchFilter.location}
                </span>
              )}

              {hasActiveSalaryFilter && (
                <span className="bg-green-100 px-3 py-2 rounded-full text-sm">
                  {appliedSalaryRange.min === "" ? "0" : appliedSalaryRange.min}
                  {" - "}
                  {appliedSalaryRange.max === "" ? "No limit" : appliedSalaryRange.max} LPA
                </span>
              )}
            </div>
          </div>
        )}

        {/* FILTER HEADING */}
        <div className="mb-6">
          <h3 className="w-full bg-gray-100 py-2 px-3 rounded-lg font-semibold">
            Job Filters
          </h3>
        </div>

        {/* SALARY FILTER */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">
            Search By Salary Range
          </h3>

          <label htmlFor="min-salary" className="block text-sm text-gray-600 mb-1">
            Minimum Salary (LPA)
          </label>

          <input
            type="number"
            min="0"
            id="min-salary"
            step="0.1"
            placeholder="e.g. 10"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 outline-none focus:border-blue-500"
          />

          <label htmlFor="max-salary" className="block text-sm text-gray-600 mb-1">
            Maximum Salary (LPA)
          </label>

          <input
            type="number"
            min="0"
            id="max-salary"
            step="0.1"
            placeholder="e.g. 20"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          />

          {salaryError && (
            <p role="alert" className="text-red-500 text-sm mt-2">
              {salaryError}
            </p>
          )}

          <button
            onClick={handleSalarySearch}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
          >
            Search Salary
          </button>
        </div>

        <div className="mb-8">
          <label htmlFor="job-level" className="block font-semibold text-lg mb-4">Experience Level</label>
          <select id="job-level" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="">All levels</option>
            {["Fresher", "Beginner Level", "Intermediate Level", "Senior Level", "0-1 Years", "1-3 Years", "3-5 Years", "5+ Years"].map((level) => <option key={level}>{level}</option>)}
          </select>
        </div>
        <div className="mb-8">
          <label htmlFor="job-skills" className="block font-semibold text-lg mb-4">Skills</label>
          <input id="job-skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, JavaScript" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          <p className="text-xs text-gray-500 mt-2">Separate skills with commas. Jobs must match each skill.</p>
        </div>
        {/* CATEGORIES */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">
            Search By Categories
          </h3>

          <ul className="space-y-3">
            {JobCategories.map((item, i) => (
              <li key={i} className="flex gap-3">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(item)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories((prev) => [...prev, item]);
                    } else {
                      setSelectedCategories((prev) =>
                        prev.filter((cat) => cat !== item)
                      );
                    }
                  }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* LOCATIONS */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">
            Search By Location
          </h3>

          <ul className="space-y-3">
            {JobLocations.map((item, i) => (
              <li key={i} className="flex gap-3">
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(item)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLocations((prev) => [...prev, item]);
                    } else {
                      setSelectedLocations((prev) =>
                        prev.filter((loc) => loc !== item)
                      );
                    }
                  }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CLEAR FILTERS */}
        <button
          onClick={clearSearch}
          className="w-full border border-red-300 text-red-600 hover:bg-red-50 py-2 rounded-lg font-medium transition"
        >
          Clear Filters
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0">
        <h2 className="text-3xl font-bold">Latest Jobs</h2>

        <p className="text-gray-500 mt-2 mb-4">
          Get your desired job from top companies.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          {loading ? "Searching jobs..." : searchError ? "Search unavailable" : `Showing ${filteredJobs.length} matching jobs`}
        </p>

        {searchError && <p role="alert" className="text-red-600 mb-4">{searchError} <button className="underline" onClick={clearSearch}>Reset and retry</button></p>}
        {/* JOB GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && !searchError && (currentJobs.length > 0 ? (
            currentJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))
          ) : (
            <div className="col-span-3 py-20 text-center">
              <h2 className="text-3xl font-bold">No Jobs Found</h2>
              <p className="text-gray-500 mt-3">
                Try another salary range or remove filters.
              </p>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 border rounded ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListing;
