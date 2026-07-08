import React from "react";
import { assets } from "../assets/assets";

const AppDownload = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* CARD */}
        <div className="bg-gray-50 shadow-lg rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-12">
          {/* LEFT CONTENT */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
              Download Our App & <br />
              Get Jobs On The Go 🚀
            </h2>

            <p className="mt-5 text-gray-500 text-base md:text-lg max-w-lg">
              Stay updated with the latest job opportunities, apply faster, and
              track your applications anytime, anywhere.
            </p>

            {/* STORE BUTTONS */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <img
                src={assets.play_store}
                alt="Play Store"
                className="h-12 cursor-pointer hover:scale-105 transition"
              />

              <img
                src={assets.app_store}
                alt="App Store"
                className="h-12 cursor-pointer hover:scale-105 transition"
              />
            </div>
          </div>

          {/* RIGHT IMAGE */}
          {/* RIGHT IMAGE - Hidden on Mobile */}
<div className="hidden md:flex flex-1 justify-center">
  <img
    src={assets.app_main_img}
    alt="App Preview"
    className="w-full max-w-[260px] lg:max-w-[340px] object-contain"
  />
</div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;