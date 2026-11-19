import { toggleTheme, useTheme } from "../utils/theme";

// Sun / moon switch for light and dark mode.
const ThemeToggle = ({ className = "" }) => {
  const theme = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={`relative inline-flex items-center w-14 h-8 rounded-full border transition-colors shrink-0 ${
        dark ? "bg-slate-700 border-slate-600" : "bg-sky-100 border-sky-200"
      } ${className}`}
    >
      <span
        className={`relative z-10 w-6 h-6 rounded-full shadow-md flex items-center justify-center text-sm transition-transform duration-300 ${
          dark ? "translate-x-7 bg-slate-900" : "translate-x-0.5 bg-white"
        }`}
        aria-hidden="true"
      >
        {dark ? "🌙" : "☀️"}
      </span>
    </button>
  );
};

export default ThemeToggle;
