import React, { useState, useEffect, useContext } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import ResumeModal from "../components/ResumeModal";
import { AppContext } from "../context/AppContext";

const ApplicationDashboard = () => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { backendUrl } = useContext(AppContext);

  const [resumeOpen, setResumeOpen] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDataAndApplications = async () => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = await getToken();

      // Fetch Applications
      const { data: appData } = await axios.get(`${backendUrl}/api/users/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (appData.success) {
        setAppliedJobs(appData.applications || []);
      }

      // Fetch User Data for resume link
      const { data: userData } = await axios.get(`${backendUrl}/api/users/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userData.success) {
        setUserProfile(userData.user);
      }
    } catch (error) {
      console.error("Fetch User Applications Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchUserDataAndApplications();
    } else {
      setLoading(false);
    }
  }, [isSignedIn]);

  const badgeColor = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-5">
        <h1 className="text-4xl font-bold">My Applications</h1>

        <p className="text-gray-500 mt-2">
          Track applications and manage resume.
        </p>

        <div className="grid lg:grid-cols-3 gap-8 mt-10">
          {/* LEFT */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <img
                src={
                  user?.imageUrl ||
                  userProfile?.image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.fullName || "User"
                  )}`
                }
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto object-cover border"
              />

              <h2 className="text-xl font-bold text-center mt-4">
                {user?.fullName || userProfile?.name || "Guest User"}
              </h2>

              <p className="text-center text-gray-500 text-sm mt-1">
                {user?.primaryEmailAddress?.emailAddress || userProfile?.email}
              </p>

              {userProfile?.resume ? (
                <div className="mt-6 space-y-3">
                  <a
                    href={userProfile.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition shadow-sm"
                  >
                    📄 View Resume
                  </a>
                  <button
                    onClick={() => setResumeOpen(true)}
                    className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-2.5 rounded-lg font-medium transition text-sm"
                  >
                    Replace / Update Resume
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setResumeOpen(true)}
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
                >
                  Upload Resume
                </button>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Applied Jobs</h2>

            {loading ? (
              <div className="text-center py-10 text-gray-500 font-medium">
                Loading applications...
              </div>
            ) : !isSignedIn ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-lg">
                  Please log in to view your submitted applications.
                </p>
              </div>
            ) : appliedJobs.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-lg">
                  You haven't applied to any jobs yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appliedJobs.map((app, index) => {
                  const job = app.jobId || {};
                  const company = app.companyId || {};
                  const status = app.status || "Pending";

                  return (
                    <div
                      key={app._id || index}
                      className="border rounded-xl p-5 flex justify-between items-center hover:shadow-sm transition"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          {company.image && (
                            <img
                              src={company.image}
                              alt={company.name}
                              className="w-8 h-8 object-contain rounded"
                            />
                          )}
                          <h3 className="font-semibold text-lg text-gray-900">
                            {job.title || "Job Title"}
                          </h3>
                        </div>

                        <p className="text-gray-500 text-sm mt-1">
                          {company.name || "Company"}
                        </p>

                        <p className="text-xs text-gray-400 mt-2">
                          Applied on{" "}
                          {app.date
                            ? new Date(app.date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </p>
                      </div>

                      <span
                        className={`px-4 py-2 rounded-full text-xs font-semibold ${badgeColor(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ResumeModal
        open={resumeOpen}
        onClose={() => setResumeOpen(false)}
        existingResume={userProfile?.resume}
        onSuccess={fetchUserDataAndApplications}
      />
    </div>
  );
};

export default ApplicationDashboard;