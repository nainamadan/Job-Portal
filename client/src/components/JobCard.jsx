import React from "react";
import { assets } from "../assets/assets";
import { useNavigate} from "react-router-dom";

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  return (
   <div
  className="
    w-full
    max-w-[420px]
    bg-white
    border border-gray-200
    rounded-xl
    p-5
    shadow-sm
    transition-all duration-200
    hover:border-blue-500
    hover:shadow-lg
    hover:-translate-y-1
  "
>
      {/* COMPANY + TITLE */}
      <div className="flex items-center gap-4 mb-5">
       <img
  src={job.companyId.image}
  alt={job.companyId.name}
  className="w-14 h-14 object-contain"
/>

        <div>
          <h3 className="font-semibold text-xl text-gray-800 line-clamp-1">
            {job.title}
          </h3>
 <p className="text-gray-500">
    {job.companyId.name}
  </p>
         <div className="flex items-center gap-2 mt-2 flex-wrap">
  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
    📍 {job.location}
  </span>

  <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
    💼 {job.level}
  </span>
</div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <p
        className="text-base text-gray-600 line-clamp-4 mb-6"
        dangerouslySetInnerHTML={{
          __html: job.description.slice(0, 180),
        }}
      />

      {/* BUTTONS */}
      <div className="flex gap-4">
       <button
  onClick={() => navigate(`/apply-job/${job._id}`)}
  className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition"
>
  Apply Now
</button>

        <button
  onClick={() => navigate(`/job/${job._id}`)}
  className="flex-1 border border-gray-300 py-3 rounded-lg text-base font-medium hover:border-blue-500 hover:text-blue-600 transition"
>
  Learn More
</button>
      </div>
    </div>
  );
};

export default JobCard;