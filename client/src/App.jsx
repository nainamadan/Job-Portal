import React, { useContext } from "react";
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from './pages/Home';
import Applyjob from './pages/Applyjob';
import JobDetails from "./pages/JobDetails";
import AIMatcher from "./pages/AIMatcher";
import ApplicationDashboard from "./pages/ApplicationDashboard";
import Dashboard from "./pages/Dashboard";
import AddJob from "./pages/AddJob";
import ManageJobs from "./pages/ManageJobs";
import ViewApplications from "./pages/ViewApplications";
import { AppContext } from "./context/AppContext";

const App = () => {
  const location = useLocation();
  const { companyToken } = useContext(AppContext);

  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const hasRecruiterAccess = !!companyToken || !!localStorage.getItem("companyToken");

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {!isDashboardRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/apply-job/:id" element={<Applyjob />} />
        <Route path="/ai-match" element={<AIMatcher />} />
        <Route path="/my-applications" element={<ApplicationDashboard />} />

        <Route
          path="/dashboard"
          element={hasRecruiterAccess ? <Dashboard /> : <Navigate to="/" replace />}
        >
          <Route index element={<AddJob />} />
          <Route path="add-job" element={<AddJob />} />
          <Route path="manage-jobs" element={<ManageJobs />} />
          <Route path="view-applications" element={<ViewApplications />} />
        </Route>
      </Routes>

      {!isDashboardRoute && <Footer />}
    </>
  );
};

export default App;