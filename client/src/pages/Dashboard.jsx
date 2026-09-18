import React, { useState, useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const Dashboard = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const { companyData, setCompanyToken, setCompanyData } = useContext(AppContext);

  const logoutRecruiter = () => {
    localStorage.removeItem("isRecruiterLoggedIn");
    localStorage.removeItem("companyToken");
    if (setCompanyToken) setCompanyToken(null);
    if (setCompanyData) setCompanyData(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top Navbar */}

      <div className="h-16 bg-white border-b flex items-center justify-between px-8">

        <img
          src={assets.logo}
          className="h-10 cursor-pointer"
          alt="Logo"
          onClick={() => navigate("/")}
        />

        <div className="relative">

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3"
          >

            {/* Company Logo */}
            <img
              src={companyData?.image || assets.company_icon}
              className="w-10 h-10 rounded-full object-cover border"
              alt="Company"
            />

            {/* Company Name */}
            <p className="font-medium">
              {companyData?.name || companyData?.companyName || "Recruiter"}
            </p>

          </button>

          {showMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border">

              <button className="w-full text-left px-5 py-3 hover:bg-gray-100">
                My Profile
              </button>

              <button
                onClick={logoutRecruiter}
                className="w-full text-left px-5 py-3 text-red-500 hover:bg-gray-100"
              >
                Logout
              </button>

            </div>
          )}

        </div>

      </div>

      {/* Main */}

      <div className="flex">

        {/* Sidebar */}

        <div className="w-64 bg-white border-r min-h-[calc(100vh-64px)]">

          <NavLink
            to="/dashboard/manage-jobs"
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-4 border-l-4 ${
                isActive
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-transparent"
              }`
            }
          >
            <img
              src={assets.home_icon}
              className="w-5"
              alt=""
            />

            <span>Manage Jobs</span>
          </NavLink>

          <NavLink
            to="/dashboard/add-job"
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-4 border-l-4 ${
                isActive
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-transparent"
              }`
            }
          >
            <img
              src={assets.add_icon}
              className="w-5"
              alt=""
            />

            <span>Add Job</span>
          </NavLink>

          <NavLink
            to="/dashboard/view-applications"
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-4 border-l-4 ${
                isActive
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-transparent"
              }`
            }
          >
            <img
              src={assets.person_tick_icon}
              className="w-5"
              alt=""
            />

            <span>Applications</span>
          </NavLink>

        </div>

        {/* Page */}

        <div className="flex-1 p-8">

          <Outlet />

        </div>

      </div>

    </div>
  );
};

export default Dashboard;