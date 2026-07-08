import React, { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const AddJob = () => {
  const [jobData, setJobData] = useState({
    title: "",
    category: "",
    location: "",
    level: "",
    salary: "",
  });

  const [description, setDescription] = useState("");

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value,
    });
  };
const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["clean"],
    ],
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const finalData = {
      ...jobData,
      description,
    };

    console.log(finalData);
  };

  return (
    <div className="max-w-5xl bg-white rounded-2xl shadow-md p-8">

      <h1 className="text-3xl font-bold mb-8">
        Add New Job
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Job Title */}

        <div>
          <label className="font-medium mb-2 block">
            Job Title
          </label>

          <input
            type="text"
            name="title"
            value={jobData.title}
            onChange={handleChange}
            placeholder="Frontend Developer"
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}

        <div>
          <label className="font-medium mb-2 block">
            Job Description
          </label>

          <ReactQuill
            theme="snow"
            value={description}
            onChange={setDescription}
            className="bg-white"
             modules={modules}
          />
        </div>

        {/* Category Location */}

        <div className="grid md:grid-cols-2 gap-5">

          <div>
            <label className="font-medium block mb-2">
              Category
            </label>

            <select
              name="category"
              value={jobData.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="">Select</option>
              <option>Programming</option>
              <option>Design</option>
              <option>Marketing</option>
              <option>Finance</option>
            </select>
          </div>

          <div>
            <label className="font-medium block mb-2">
              Location
            </label>

            <select
              name="location"
              value={jobData.location}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="">Select</option>
              <option>Delhi</option>
              <option>Bangalore</option>
              <option>Hyderabad</option>
              <option>Pune</option>
            </select>
          </div>

        </div>

        {/* Level Salary */}

        <div className="grid md:grid-cols-2 gap-5">

          <div>
            <label className="font-medium block mb-2">
              Experience
            </label>

            <select
              name="level"
              value={jobData.level}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option value="">Select</option>
              <option>Fresher</option>
              <option>1-3 Years</option>
              <option>3-5 Years</option>
              <option>5+ Years</option>
            </select>
          </div>

          <div>
            <label className="font-medium block mb-2">
              Salary (LPA)
            </label>

            <input
              type="number"
              name="salary"
              value={jobData.salary}
              onChange={handleChange}
              placeholder="10"
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-semibold transition"
        >
          Add Job
        </button>

      </form>

    </div>
  );
};

export default AddJob;