import React, { useState, useEffect } from "react";
import { Routes, Route , useLocation } from 'react-router-dom'
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from './pages/Home'
import Applyjob from './pages/Applyjob'
import JobDetails from "./pages/JobDetails";
import ApplicationDashboard from "./pages/ApplicationDashboard";
 import Dashboard from "./pages/Dashboard";
 import AddJob from "./pages/AddJob";
import ManageJobs from "./pages/ManageJobs";
import ViewApplications from "./pages/ViewApplications";

const App = () => {
const location = useLocation();

const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const [isRecruiterLoggedIn, setIsRecruiterLoggedIn] = useState(false);

  useEffect(() => {
    const recruiter =
      localStorage.getItem("isRecruiterLoggedIn") === "true" ||
      !!localStorage.getItem("companyToken");

    setIsRecruiterLoggedIn(recruiter);
  }, [location.pathname]);

  const hasRecruiterAccess = isRecruiterLoggedIn || !!localStorage.getItem("companyToken");

  return (
  <>
    {!isDashboardRoute && <Navbar />}

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/job/:id" element={<JobDetails />} />
      <Route path="/apply-job/:id" element={<Applyjob />} />
      <Route path="/my-applications" element={<ApplicationDashboard />} />

      {hasRecruiterAccess && (
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<AddJob />} />
          <Route path="add-job" element={<AddJob />} />
          <Route path="manage-jobs" element={<ManageJobs />} />
          <Route path="view-applications" element={<ViewApplications />} />
        </Route>
      )}
    </Routes>

    {!isDashboardRoute && <Footer />}
  </>
);
};

export default App;