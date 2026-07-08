import React, { useState, useRef } from "react";

const ResumeModal = ({ open, onClose }) => {
  const [resume, setResume] = useState(null);
  const editInputRef = useRef(null);

  if (!open) return null;

  const handleUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleView = () => {
    if (!resume) return;

    const fileURL = URL.createObjectURL(resume);
    window.open(fileURL, "_blank");
  };

  const handleEditClick = () => {
    editInputRef.current.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            My Resume
          </h2>

          <button
            onClick={onClose}
            className="text-3xl text-gray-400 hover:text-red-500 transition"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-8">

          {!resume ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">

              <div className="text-6xl mb-4">📄</div>

              <h3 className="text-xl font-semibold">
                No Resume Uploaded
              </h3>

              <p className="text-gray-500 mt-2">
                Upload your latest resume (PDF, DOC or DOCX)
              </p>

              <label className="cursor-pointer">

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={handleUpload}
                />

                <div className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition">
                  Upload Resume
                </div>

              </label>

            </div>
          ) : (
            <div className="border rounded-xl p-8 text-center bg-gray-50">

              <div className="text-6xl mb-4">📄</div>

              <h3 className="text-xl font-bold text-gray-800">
                {resume.name}
              </h3>

              <p className="text-gray-500 mt-2">
                {(resume.size / 1024).toFixed(1)} KB
              </p>

              <div className="flex justify-center gap-4 mt-8">

                <button
                  onClick={handleView}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
                >
                  View Resume
                </button>

                <button
                  onClick={handleEditClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
                >
                  Replace Resume
                </button>

              </div>

            </div>
          )}

          {/* Hidden Replace Input */}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            hidden
            ref={editInputRef}
            onChange={handleUpload}
          />

        </div>

        {/* Footer */}
        <div className="border-t px-8 py-5 flex justify-end">

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border hover:bg-gray-100 transition"
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
};

export default ResumeModal;