import React, { useContext, useState, useEffect, useRef } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import { assets } from "../assets/assets.js";
import { AppContext } from "../context/AppContext";

const Hero = () => {
  const { setSearchFilter, setIsSearched } =
    useContext(AppContext);
const listingRef = useRef(null);
  const titleRef = useRef(null);
  const locRef = useRef(null);

  const onSearch = () => {
    const searchData = {
      title: titleRef.current.value,
      location: locRef.current.value,
    };

    setSearchFilter(searchData);
    setIsSearched(true);

    console.log("Search Data:", searchData);
  };
setTimeout(() => {
  const section = document.getElementById("job-listing");

  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}, 100);
  return (
    <>
      <div className="px-4 sm:px-6 lg:px-12 py-6">

        <section className="bg-gradient-to-r from-sky-300 via-blue-500 to-blue-800 min-h-[70vh] flex items-center rounded-2xl sm:rounded-3xl shadow-xl">

          <div 
           ref={listingRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex justify-center">

            <div className="max-w-4xl text-white text-center">

              {/* Heading */}
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight">
                Over <span className="text-yellow-300">10,000+</span> Jobs
                <br />
                Ready to Apply
              </h1>

              {/* Description */}
              <p className="mt-5 sm:mt-6 text-sm sm:text-lg md:text-xl text-blue-50 max-w-3xl mx-auto">
                Discover thousands of opportunities from top companies across
                different industries. InsiderJobs helps job seekers connect with
                recruiters and find the perfect role.
              </p>

              {/* Search Bar */}
              <div className="mt-8 sm:mt-10 bg-white rounded-xl p-3 flex flex-col md:flex-row gap-3 shadow-xl max-w-4xl mx-auto">

                {/* Job Search */}
                <div className="flex items-center flex-1 px-3 sm:px-4 border border-gray-200 rounded-lg">
                  <FaSearch className="text-gray-500" size={18} />

                  <input
                    ref={titleRef}
                    type="text"
                    placeholder="Search jobs..."
                    className="w-full px-2 sm:px-3 py-2 sm:py-3 outline-none text-gray-700"
                  />
                </div>

                {/* Location */}
                <div className="flex items-center flex-1 px-3 sm:px-4 border border-gray-200 rounded-lg">
                  <FaMapMarkerAlt className="text-gray-500" size={18} />

                  <input
                    ref={locRef}
                    type="text"
                    placeholder="Location"
                    className="w-full px-2 sm:px-3 py-2 sm:py-3 outline-none text-gray-700"
                  />
                </div>

                {/* Button */}
                <button
                  onClick={onSearch}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold transition"
                >
                  Search
                </button>

              </div>

            </div>

          </div>

        </section>
      </div>

      {/* Trusted Section */}
      <section className="bg-white py-8 sm:py-10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8">

            <p className="text-gray-600 font-medium text-base sm:text-lg">
              Trusted By
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">

              <img src={assets.microsoft_logo} className="h-6 sm:h-8" />
              <img src={assets.walmart_logo} className="h-6 sm:h-8" />
              <img src={assets.accenture_logo} className="h-6 sm:h-8" />
              <img src={assets.amazon_logo} className="h-6 sm:h-8" />
              <img src={assets.samsung_logo} className="h-6 sm:h-8" />
              <img src={assets.adobe_logo} className="h-6 sm:h-8" />

            </div>

          </div>

        </div>
      </section>

    </>
  );
};

export default Hero;