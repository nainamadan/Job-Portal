import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiLayout, FiMap, FiMenu, FiMessageSquare, FiShield, FiX } from "react-icons/fi";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import RecruiterLogin from "./RecruiterLogin";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { companyToken } = useContext(AppContext);
  const { pathname } = useLocation();
  const isRecruiterLoggedIn = !!companyToken || !!localStorage.getItem("companyToken");
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);
  const [expandedPath, setExpandedPath] = useState(null);
  const menuOpen = expandedPath === pathname;
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);
  const closeMenu = () => setExpandedPath(null);

  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event) => {
      if (event.type === "keydown" && event.key === "Escape") {
        setExpandedPath(null);
        menuButtonRef.current?.focus();
      } else if (event.type === "pointerdown" && !navRef.current?.contains(event.target)) {
        setExpandedPath(null);
      }
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [menuOpen]);

  return (
    <>
      <nav ref={navRef} className="site-nav bg-white shadow-sm border-b" aria-label="Main navigation">
        <div className="site-nav-shell">
          <Link to="/" className="site-brand" onClick={closeMenu} aria-label="InsiderJobs home"><img src={assets.logo} alt="InsiderJobs" className="theme-logo" /></Link>
          <div id="site-navigation-links" className={`site-nav-links${menuOpen ? " is-open" : ""}`}>
            <Link to="/learning-roadmap" onClick={closeMenu} className="border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"><FiMap />Learning Roadmap</Link>
            <Link to="/skill-proof-vault" onClick={closeMenu} className="border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"><FiShield />Skill Proof Vault</Link>
            <Link to="/portfolio-generator" onClick={closeMenu} className="border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"><FiLayout />Portfolio Generator</Link>
            <Link to="/my-applications" onClick={closeMenu} className="bg-blue-600 hover:bg-blue-700 text-white">My Applications</Link>
            <Link to="/messages" onClick={closeMenu} className="border border-gray-300 hover:bg-gray-100"><FiMessageSquare />Messages</Link>
            {isRecruiterLoggedIn ? <Link to="/dashboard" onClick={closeMenu} className="bg-green-600 text-white hover:bg-green-700">Recruiter Dashboard</Link> : <button type="button" onClick={() => { closeMenu(); setShowRecruiterLogin(true); }} className="border border-gray-300 hover:bg-gray-100">Recruiter Login</button>}
          </div>
          <div className="site-nav-actions">
            <ThemeToggle />
            <SignedOut><SignInButton mode="modal"><button className="site-sign-in bg-blue-600 hover:bg-blue-700 text-white">Sign in<span className="hidden sm:inline"> / Register</span></button></SignInButton></SignedOut>
            <SignedIn><UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-10 h-10" } }} /></SignedIn>
            <button ref={menuButtonRef} type="button" className="site-menu-toggle border border-gray-300 hover:bg-gray-100" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="site-navigation-links" onClick={() => setExpandedPath(menuOpen ? null : pathname)}>{menuOpen ? <FiX /> : <FiMenu />}</button>
          </div>
        </div>
      </nav>
      <RecruiterLogin open={showRecruiterLogin} onClose={() => setShowRecruiterLogin(false)} />
    </>
  );
}
