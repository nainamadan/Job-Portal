import React from "react";
import { assets } from "../assets/assets";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-20 py-6 flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left */}
        <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-5 min-w-0 text-center lg:text-left">
          <img
            src={assets.logo}
            alt="InsiderJobs"
            className="theme-logo w-44 sm:w-52 h-auto shrink-0"
          />

          <span className="text-gray-300 text-3xl hidden lg:block">|</span>

         <p className="text-sm sm:text-base text-gray-600 font-semibold">
            © {new Date().getFullYear()} InsiderJobs. All rights reserved.
          </p>
        </div>

        {/* Right */}
       {/* Right */}
<div className="flex items-center gap-5">
  <a
    href="#"
    aria-label="Facebook"
    className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-xl text-gray-500 transition-all duration-300 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white hover:scale-110"
  >
    <FaFacebookF />
  </a>

  <a
    href="#"
    aria-label="X"
    className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-xl text-gray-500 transition-all duration-300 hover:bg-black hover:border-black hover:text-white hover:scale-110"
  >
    <FaXTwitter />
  </a>

  <a
    href="#"
    aria-label="Instagram"
    className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-xl text-gray-500 transition-all duration-300 hover:bg-[#E4405F] hover:border-[#E4405F] hover:text-white hover:scale-110"
  >
    <FaInstagram />
  </a>
</div>
      </div>
    </footer>
  );
};

export default Footer;
