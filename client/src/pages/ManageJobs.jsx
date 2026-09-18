import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const ManageJobs = () => {
  const navigate = useNavigate();
  const { backendUrl, companyToken, fetchJobs } = useContext(AppContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanyJobs = async () => {
    try {
      setLoading(true);
      const token = companyToken || localStorage.getItem("companyToken");

      const { data } = await axios.get(`${backendUrl}/api/company/list-jobs`, {
        headers: { token },
      });

      if (data.success) {
        setJobs(data.jobsData || data.jobs || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch Company Jobs Error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch company jobs");
    } finally {
      setLoading(false);
    }
  };

  const changeJobVisibility = async (jobId) => {
    try {
      const token = companyToken || localStorage.getItem("companyToken");

      const { data } = await axios.put(
        `${backendUrl}/api/company/change-visibility`,
        { id: jobId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchCompanyJobs();
        if (fetchJobs) fetchJobs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Change Visibility Error:", error);
      toast.error(error.response?.data?.message || "Failed to update visibility");
    }
  };

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Manage Jobs</h2>

        <button
          onClick={() => navigate("/dashboard/add-job")}
          className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Add New Job
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 font-medium">
          Loading jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">No jobs posted yet.</p>
          <button
            onClick={() => navigate("/dashboard/add-job")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Post First Job
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">Job Title</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-center">Applicants</th>
                <th className="px-5 py-3 text-center">Visible</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job, index) => (
                <tr
                  key={job._id || job.id || index}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-5 py-4">{index + 1}</td>

                  <td className="px-5 py-4 font-medium">{job.title}</td>

                  <td className="px-5 py-4">
                    {job.date
                      ? new Date(job.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </td>

                  <td className="px-5 py-4">{job.location}</td>

                  <td className="px-5 py-4 text-center">
                    {job.applicants ?? 0}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={!!job.visible}
                      onChange={() => changeJobVisibility(job._id)}
                      className="w-5 h-5 accent-blue-600 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;