// import React, { useState, useContext } from "react";
// import ReactQuill from "react-quill-new";
// import "react-quill-new/dist/quill.snow.css";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { AppContext } from "../context/AppContext";

// const AddJob = () => {
//   const navigate = useNavigate();
//   const { backendUrl, companyToken, fetchJobs } = useContext(AppContext);

//   const [jobData, setJobData] = useState({
//     title: "",
//     category: "",
//     location: "",
//     level: "",
//     salary: "",
//   });

//   const [description, setDescription] = useState("");
//   const [loading, setLoading] = useState(false);
// const [aiLoading, setAiLoading] = useState(false);
//   const handleChange = (e) => {
//     setJobData({
//       ...jobData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const modules = {
//     toolbar: [
//       [{ header: [1, 2, 3, false] }],
//       ["bold", "italic", "underline", "strike"],
//       [{ list: "ordered" }, { list: "bullet" }],
//       [{ color: [] }, { background: [] }],
//       ["link"],
//       ["clean"],
//     ],
//   };
// const generateAIJobDescription = async () => {
//   if (!jobData.title) {
//     toast.error("Please enter Job Title first");
//     return;
//   }

//   try {
//     setAiLoading(true);

//     const token = companyToken || localStorage.getItem("companyToken");

//     const { data } = await axios.post(
//       `${backendUrl}/api/company/generate-job-description`,
//       {
//         title: jobData.title,
//         category: jobData.category,
//         level: jobData.level,
//         location: jobData.location,
//         salary: jobData.salary,
//       },
//       {
//         headers: {
//           token,
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );


//     if (data.success) {
//       setDescription(data.description);
//       toast.success("AI Job Description Generated!");
//     } else {
//       toast.error(data.message || "Failed to generate description");
//     }
//   } catch (error) {
//     console.error("AI Description Error:", error);

//     toast.error(
//       error.response?.data?.message ||
//       "Failed to generate AI description"
//     );
//   } finally {
//     setAiLoading(false);
//   }
// };
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!jobData.title || !description || !jobData.category || !jobData.location || !jobData.level || !jobData.salary) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     try {
//       setLoading(true);
//       const token = companyToken || localStorage.getItem("companyToken");

//       const finalData = {
//         ...jobData,
//         salary: Number(jobData.salary),
//         description,
//       };

//       const { data } = await axios.post(
//         `${backendUrl}/api/company/post-job`,
//         finalData,
//         { headers: { token } }
//       );

//       if (data.success) {
//         toast.success(data.message || "Job Posted Successfully!");
//         setJobData({
//           title: "",
//           category: "",
//           location: "",
//           level: "",
//           salary: "",
//         });
//         setDescription("");
//         if (fetchJobs) fetchJobs();
//         navigate("/dashboard/manage-jobs");
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error("Add Job Error:", error);
//       toast.error(error.response?.data?.message || "Failed to post job");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-5xl bg-white rounded-2xl shadow-md p-8">

//       <h1 className="text-3xl font-bold mb-8">
//         Add New Job
//       </h1>

//       <form onSubmit={handleSubmit} className="space-y-6">

//         {/* Job Title */}

//         <div>
//           <label className="font-medium mb-2 block">
//             Job Title
//           </label>

//           <input
//             type="text"
//             name="title"
//             value={jobData.title}
//             onChange={handleChange}
//             placeholder="Frontend Developer"
//             className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Description */}

//         <div>
//   <div className="flex items-center justify-between mb-2">
    
//     <label className="font-medium">
//       Job Description
//     </label>

//     <button
//       type="button"
//       onClick={generateAIJobDescription}
//       disabled={aiLoading}
//       className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-60"
//     >
//       <span>✨</span>

//       {aiLoading ? "Generating..." : "Generate with AI"}
//     </button>

//   </div>

//   <ReactQuill
//     theme="snow"
//     value={description}
//     onChange={setDescription}
//     className="bg-white"
//     modules={modules}
//   />

//   <p className="text-sm text-gray-500 mt-2">
//     Generate a professional job description using AI.
//     You can edit it before posting.
//   </p>
// </div>

//         {/* Category Location */}

//         <div className="grid md:grid-cols-2 gap-5">

//           <div>
//             <label className="font-medium block mb-2">
//               Category
//             </label>

//             <select
//               name="category"
//               value={jobData.category}
//               onChange={handleChange}
//               className="w-full border rounded-lg px-4 py-3"
//             >
//               <option value="">Select</option>
//               <option>Programming</option>
//               <option>Design</option>
//               <option>Marketing</option>
//               <option>Finance</option>
//             </select>
//           </div>

//           <div>
//             <label className="font-medium block mb-2">
//               Location
//             </label>

//             <select
//               name="location"
//               value={jobData.location}
//               onChange={handleChange}
//               className="w-full border rounded-lg px-4 py-3"
//             >
//               <option value="">Select</option>
//               <option>Delhi</option>
//               <option>Bangalore</option>
//               <option>Hyderabad</option>
//               <option>Pune</option>
//             </select>
//           </div>

//         </div>

//         {/* Level Salary */}

//         <div className="grid md:grid-cols-2 gap-5">

//           <div>
//             <label className="font-medium block mb-2">
//               Experience
//             </label>

//             <select
//               name="level"
//               value={jobData.level}
//               onChange={handleChange}
//               className="w-full border rounded-lg px-4 py-3"
//             >
//               <option value="">Select</option>
//               <option>Fresher</option>
//               <option>1-3 Years</option>
//               <option>3-5 Years</option>
//               <option>5+ Years</option>
//             </select>
//           </div>

//           <div>
//             <label className="font-medium block mb-2">
//               Salary (LPA)
//             </label>

//             <input
//               type="number"
//               name="salary"
//               value={jobData.salary}
//               onChange={handleChange}
//               placeholder="10"
//               className="w-full border rounded-lg px-4 py-3"
//             />
//           </div>

//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-semibold transition disabled:opacity-60"
//         >
//           {loading ? "Adding Job..." : "Add Job"}
//         </button>

//       </form>

//     </div>
//   );
// };

// export default AddJob;



import React, { useState, useContext } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const AddJob = () => {
  const navigate = useNavigate();

  const { backendUrl, companyToken, fetchJobs } =
    useContext(AppContext);

  const [jobData, setJobData] = useState({
    title: "",
    category: "",
    location: "",
    level: "",
    salary: "",
    applicationDurationDays: "15",
  });

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value,
    });
  };

  // React Quill toolbar
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

  // Generate AI Job Description
  const generateAIJobDescription = async () => {
    if (!jobData.title.trim()) {
      toast.error("Please enter Job Title first");
      return;
    }

    try {
      setAiLoading(true);

      const token =
        companyToken || localStorage.getItem("companyToken");

      const { data } = await axios.post(
        `${backendUrl}/api/company/generate-job-description`,
        {
          title: jobData.title,
          category: jobData.category,
          level: jobData.level,
          location: jobData.location,
          salary: jobData.salary,
        },
        {
          headers: {
            token,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setDescription(data.description);
        toast.success("AI Job Description Generated!");
      } else {
        toast.error(
          data.message || "Failed to generate description"
        );
      }
    } catch (error) {
      console.error("AI Description Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to generate AI description"
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Submit Job
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !jobData.title.trim() ||
      !description.trim() ||
      !jobData.category ||
      !jobData.location ||
      !jobData.level ||
      !jobData.salary
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (Number(jobData.salary) <= 0) {
      toast.error("Please enter a valid salary");
      return;
    }

    try {
      setLoading(true);

      const token =
        companyToken || localStorage.getItem("companyToken");

      const finalData = {
        ...jobData,
        salary: Number(jobData.salary),
        applicationDurationDays: Number(
          jobData.applicationDurationDays
        ),
        description,
      };

      const { data } = await axios.post(
        `${backendUrl}/api/company/post-job`,
        finalData,
        {
          headers: {
            token,
          },
        }
      );

      if (data.success) {
        toast.success(
          data.message || "Job Posted Successfully!"
        );

        setJobData({
          title: "",
          category: "",
          location: "",
          level: "",
          salary: "",
          applicationDurationDays: "15",
        });

        setDescription("");

        if (fetchJobs) {
          fetchJobs();
        }

        navigate("/dashboard/manage-jobs");
      } else {
        toast.error(data.message || "Failed to post job");
      }
    } catch (error) {
      console.error("Add Job Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to post job"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl bg-white rounded-2xl shadow-md p-8">

      <h1 className="text-3xl font-bold mb-2">
        Add New Job
      </h1>

      <p className="text-gray-500 mb-8">
        Fill in the details below to publish a new job opening.
      </p>

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
            required
            className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Job Description */}
        <div>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
            <label className="font-medium">
              Job Description
            </label>

            <button
              type="button"
              onClick={generateAIJobDescription}
              disabled={aiLoading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-60"
            >
              <span>✨</span>

              {aiLoading
                ? "Generating..."
                : "Generate with AI"}
            </button>
          </div>

          <ReactQuill
            theme="snow"
            value={description}
            onChange={setDescription}
            className="bg-white"
            modules={modules}
          />

          <p className="text-sm text-gray-500 mt-2">
            Generate a professional job description using AI.
            You can edit it before posting.
          </p>
        </div>

        {/* Category and Location */}
        <div className="grid md:grid-cols-2 gap-5">

          <div>
            <label className="font-medium block mb-2">
              Category
            </label>

            <select
              name="category"
              value={jobData.category}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
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
              required
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Location</option>
              <option>Delhi</option>
              <option>Bangalore</option>
              <option>Hyderabad</option>
              <option>Pune</option>
            </select>
          </div>

        </div>

        {/* Experience and Salary */}
        <div className="grid md:grid-cols-2 gap-5">

          <div>
            <label className="font-medium block mb-2">
              Experience
            </label>

            <select
              name="level"
              value={jobData.level}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Experience</option>
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
              min="1"
              required
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* Application Deadline */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">

          <label className="font-semibold block mb-2 text-gray-800">
            📅 Application Deadline
          </label>

          <select
            name="applicationDurationDays"
            value={jobData.applicationDurationDays}
            onChange={handleChange}
            required
            className="w-full border border-indigo-200 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="7">7 Days</option>
            <option value="15">15 Days</option>
            <option value="30">30 Days</option>
            <option value="45">45 Days</option>
            <option value="60">60 Days</option>
          </select>

          <p className="text-sm text-gray-600 mt-2">
            Candidates will be able to apply for this job
            for the selected number of days after posting.
          </p>

          <p className="text-xs text-indigo-600 font-medium mt-2">
            Default application duration: 15 Days
          </p>

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || aiLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Adding Job..." : "Add Job"}
        </button>

      </form>
    </div>
  );
};

export default AddJob;
