import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import RecruiterLogin from "./RecruiterLogin";
import { AppContext } from "../context/AppContext";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

const Navbar = () => {
  const { companyToken } = useContext(AppContext);
  const isRecruiterLoggedIn = !!companyToken || !!localStorage.getItem("companyToken");
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={assets.logo}
            alt="Logo"
            className="h-10 sm:h-14 w-auto object-contain"
          />
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 sm:gap-5">

          {/* My Applications */}
          <button
            onClick={() => navigate("/my-applications")}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white"
          >
            My Applications
          </button>

          {/* Recruiter Login */}
      {isRecruiterLoggedIn ? (
  <button
    onClick={() => navigate("/dashboard")}
    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
  >
    Recruiter Dashboard
  </button>
) : (
  <button
    onClick={() => setShowRecruiterLogin(true)}
    className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition"
  >
    Recruiter Login
  </button>
)}

          <RecruiterLogin
            open={showRecruiterLogin}
            onClose={() => setShowRecruiterLogin(false)}
          />

          {/* CLERK AUTH FIXED */}

          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                Login / Register
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;