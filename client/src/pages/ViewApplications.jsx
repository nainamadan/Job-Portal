import React, { useState } from "react";
import { viewApplicationsPageData } from "../assets/assets";

const ViewApplications = () => {
  const [applications, setApplications] = useState(
    viewApplicationsPageData.map((item, index) => ({
      ...item,
      id: item.id || index + 1,
      status: "Pending",
    }))
  );

  const [openMenu, setOpenMenu] = useState(null);

  const updateStatus = (id, status) => {
    setApplications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );

    setOpenMenu(null);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">
        View Applications
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr className="text-gray-700">
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Job Title</th>
              <th className="p-4 text-left">Location</th>
              <th className="p-4 text-left">Resume</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {applications.map((application, index) => (
              <tr
                key={application.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-5 py-4">{index + 1}</td>

                {/* User */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={application.imgSrc}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-medium">
                      {application.name}
                    </span>
                  </div>
                </td>

                {/* Job */}
                <td className="px-5 py-4">
                  {application.jobTitle}
                </td>

                {/* Location */}
                <td className="px-5 py-4">
                  {application.location}
                </td>

                {/* Resume */}
                <td className="px-5 py-4">
                  <a
                    href={application.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                  >
                    Resume
                  </a>
                </td>

                {/* Status */}
                <td className="px-5 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium
                    ${
                      application.status === "Accepted"
                        ? "bg-green-100 text-green-700"
                        : application.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {application.status}
                  </span>
                </td>

                {/* Action */}
                <td className="px-5 py-4 text-center relative">
                  <button
                    onClick={() =>
                      setOpenMenu(
                        openMenu === application.id
                          ? null
                          : application.id
                      )
                    }
                    className="text-2xl hover:text-blue-600"
                  >
                    &#8942;
                  </button>

                  {openMenu === application.id && (
                    <div className="absolute right-4 mt-2 w-36 bg-white rounded-lg shadow-lg border z-50">

                      <button
                        onClick={() =>
                          updateStatus(application.id, "Accepted")
                        }
                        className="block w-full text-left px-4 py-2 hover:bg-green-100 text-green-600"
                      >
                        ✔ Accept
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(application.id, "Rejected")
                        }
                        className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                      >
                        ✖ Reject
                      </button>

                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewApplications;