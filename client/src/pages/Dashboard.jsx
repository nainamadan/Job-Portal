import { useState, useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import ThemeToggle from "../components/ThemeToggle";

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

      <div className="dashboard-header min-h-16 bg-white border-b flex items-center justify-between gap-3 px-4 sm:px-6 py-3">

        <img
          src={assets.logo}
          className="theme-logo w-32 sm:w-44 h-auto cursor-pointer shrink-0"
          alt="Logo"
          onClick={() => navigate("/")}
        />

        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <ThemeToggle />
        <div className="relative">

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 min-w-0"
            aria-label="Company account menu"
            aria-expanded={showMenu}
          >

            {/* Company Logo */}
            <img
              src={companyData?.image || assets.company_icon}
              className="w-10 h-10 rounded-full object-cover border"
              alt="Company"
            />

            {/* Company Name */}
            <p className="hidden sm:block font-medium truncate max-w-48 lg:max-w-64">
              {companyData?.name || companyData?.companyName || "Recruiter"}
            </p>

          </button>

          {showMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border z-50">

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

      </div>

      {/* Main */}

      <div className="flex flex-col md:flex-row min-w-0">

        {/* Sidebar */}

        <nav aria-label="Recruiter navigation" className="dashboard-nav grid grid-cols-2 md:flex md:flex-col md:w-48 lg:w-56 shrink-0 bg-white border-b md:border-b-0 md:border-r md:min-h-[calc(100dvh-64px)]">

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

          <NavLink
            to="/dashboard/messages"
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-4 border-l-4 ${
                isActive
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-transparent"
              }`
            }
          >
            <span className="w-5 text-center" aria-hidden="true">💬</span>

            <span>Messages</span>
          </NavLink>

        </nav>

        {/* Page */}

        <main className="dashboard-content flex-1 min-w-0 p-4 sm:p-6 lg:p-8">

          <Outlet />

        </main>

      </div>

    </div>
  );
};

export default Dashboard;
