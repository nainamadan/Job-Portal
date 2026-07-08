import React from "react";
import { useNavigate } from "react-router-dom";
import { manageJobsData } from "../assets/assets";

const ManageJobs = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          Manage Jobs
        </h2>

        <button
          onClick={() => navigate("/dashboard/add-job")}
          className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Add New Job
        </button>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-100 text-gray-700">

            <tr>

              <th className="px-5 py-3 text-left">#</th>

              <th className="px-5 py-3 text-left">
                Job Title
              </th>

              <th className="px-5 py-3 text-left">
                Date
              </th>

              <th className="px-5 py-3 text-left">
                Location
              </th>

              <th className="px-5 py-3 text-center">
                Applicants
              </th>

              <th className="px-5 py-3 text-center">
                Visible
              </th>

            </tr>

          </thead>

          <tbody>

            {manageJobsData.map((job, index) => (

              <tr
                key={job.id}
                className="border-b hover:bg-gray-50 transition"
              >

                <td className="px-5 py-4">
                  {index + 1}
                </td>

                <td className="px-5 py-4 font-medium">
                  {job.title}
                </td>

               <td className="px-5 py-4">
  {new Date(job.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</td>
                <td className="px-5 py-4">
                  {job.location}
                </td>

                <td className="px-5 py-4 text-center">
                  {job.applicants}
                </td>

                <td className="px-5 py-4 text-center">

                  <input
                    type="checkbox"
                    defaultChecked={job.visible}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default ManageJobs;