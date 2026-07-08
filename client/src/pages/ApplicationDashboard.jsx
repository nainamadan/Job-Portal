import React, { useState } from "react";
import ResumeModal from "../components/ResumeModal";

const ApplicationDashboard = () => {
  const [resumeOpen, setResumeOpen] = useState(false);

  const appliedJobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "Google",
      status: "Pending",
      date: "12 Jul 2026",
    },
    {
      id: 2,
      title: "UI Designer",
      company: "Microsoft",
      status: "Accepted",
      date: "9 Jul 2026",
    },
    {
      id: 3,
      title: "React Developer",
      company: "Amazon",
      status: "Rejected",
      date: "5 Jul 2026",
    },
  ];

  const savedJobs = [
    {
      id: 1,
      title: "Backend Developer",
      company: "Adobe",
    },
    {
      id: 2,
      title: "MERN Developer",
      company: "Infosys",
    },
  ];

  const badgeColor = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-10">

      <div className="max-w-7xl mx-auto px-5">

        <h1 className="text-4xl font-bold">
          My Applications
        </h1>

        <p className="text-gray-500 mt-2">
          Track applications and manage resume.
        </p>

        <div className="grid lg:grid-cols-3 gap-8 mt-10">

          {/* LEFT */}

          <div className="space-y-6">

            <div className="bg-white rounded-xl shadow p-6">

              <img
                src="https://ui-avatars.com/api/?name=User"
                className="w-24 h-24 rounded-full mx-auto"
              />

              <h2 className="text-xl font-bold text-center mt-4">
                John Doe
              </h2>

              <p className="text-center text-gray-500">
                Frontend Developer
              </p>

              <button
                onClick={() => setResumeOpen(true)}
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg"
              >
                View Resume
              </button>

            </div>

            <div className="bg-white rounded-xl shadow p-6">

              <h2 className="font-bold text-lg mb-5">
                Saved Jobs
              </h2>

              {savedJobs.map(job => (

                <div
                  key={job.id}
                  className="border rounded-lg p-4 mb-3"
                >
                  <h3 className="font-semibold">
                    {job.title}
                  </h3>

                  <p className="text-gray-500">
                    {job.company}
                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* RIGHT */}

          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">

            <h2 className="text-2xl font-bold mb-6">
              Applied Jobs
            </h2>

            <div className="space-y-4">

              {appliedJobs.map(job => (

                <div
                  key={job.id}
                  className="border rounded-xl p-5 flex justify-between items-center"
                >

                  <div>

                    <h3 className="font-semibold text-lg">
                      {job.title}
                    </h3>

                    <p className="text-gray-500">
                      {job.company}
                    </p>

                    <p className="text-sm text-gray-400 mt-2">
                      Applied on {job.date}
                    </p>

                  </div>

                  <span
                    className={`px-4 py-2 rounded-full font-semibold ${badgeColor(job.status)}`}
                  >
                    {job.status}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

      <ResumeModal
        open={resumeOpen}
        onClose={() => setResumeOpen(false)}
      />

    </div>
  );
};

export default ApplicationDashboard;