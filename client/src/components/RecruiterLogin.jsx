import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
const RecruiterLogin = ({ open, onClose }) => {

  // "login" | "signup" | "forgot-email" | "forgot-otp" | "forgot-reset" | "upload-logo"
  const navigate = useNavigate();
  const [view, setView] = useState("login");

  const [companyLogo, setCompanyLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
 const [signupData, setSignupData] = useState({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
const { setShowRecriterLogin, backendUrl, setCompanyToken, fetchCompanyData } = useContext(AppContext);
  if (!open) return null;

  const resetAllState = () => {
    setLoginData({ email: "", password: "" });
    setSignupData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setForgotEmail("");
    setOtp(["", "", "", "", "", ""]);
    setNewPassword({ password: "", confirmPassword: "" });
    setCompanyLogo(null);
    setLogoPreview(null);
    setError("");
    setInfo("");
    setLoading(false);
  };

  const switchView = (nextView) => {
    setError("");
    setInfo("");
    setView(nextView);
  };

  const handleClose = () => {
    resetAllState();
    setView("login");
    onClose();
  };

  // ---------- Login ----------

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

const handleLoginSubmit = async (e) => {
  e.preventDefault();
  if (!loginData.email || !loginData.password) {
    setError("Please fill in all fields");
    return;
  }

  try {
    const { data } = await axios.post(
      `${backendUrl}/api/company/login`,
      loginData
    );
    if (data.success) {
      localStorage.setItem("companyToken", data.token);
      localStorage.setItem("isRecruiterLoggedIn", "true");
      if (setCompanyToken) setCompanyToken(data.token);
      if (fetchCompanyData) fetchCompanyData();
      toast.success("Login Successful");
      handleClose();
      navigate("/dashboard");
    } else {
      setError(data.message);
    }
  } catch (error) {
    console.error("Login Error:", error);
    setError(error.response?.data?.message || error.message);
  }
};
  // ---------- Signup ----------

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

const handleSignupSubmit = (e) => {
  e.preventDefault();

  const { name, email, password, confirmPassword } = signupData;

  if (!name || !email || !password || !confirmPassword) {
    setError("Please fill in all fields");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters");
    return;
  }

  setError("");
  switchView("upload-logo");
};

  const handleForgotEmailSubmit = (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      setError("Please enter your registered email");
      return;
    }

    setLoading(true);
    setError("");

    // Yahan apna actual "send OTP" API call karo
    console.log("Sending OTP to:", forgotEmail);

    // Simulated API call — apna real fetch/axios yahan lagao
    setTimeout(() => {
      setLoading(false);
      setInfo(`OTP sent to ${forgotEmail}`);
      setView("forgot-otp");
    }, 800);
  };

  // ---------- Forgot password: step 2 (OTP) ----------

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    setError("");

    // Auto-focus next box
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length < 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    // Yahan apna actual "verify OTP" API call karo
    console.log("Verifying OTP:", enteredOtp, "for", forgotEmail);

    setTimeout(() => {
      setLoading(false);
      setView("forgot-reset");
    }, 800);
  };

  const handleResendOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");

    // Yahan apna actual "resend OTP" API call karo
    console.log("Resending OTP to:", forgotEmail);

    setInfo(`OTP resent to ${forgotEmail}`);
  };

  // ---------- Forgot password: step 3 (reset) ----------

  const handleNewPasswordChange = (e) => {
    const { name, value } = e.target;
    setNewPassword((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();

    const { password, confirmPassword } = newPassword;

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Yahan apna actual "reset password" API call karo
    console.log("Resetting password for:", forgotEmail, "New password:", password);

    switchView("login");
    setInfo("Password reset successful. Please log in.");
  };

  // ---------- Company logo upload ----------

  const handleLogoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setCompanyLogo(file);
    setLogoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleRemoveLogo = () => {
    setCompanyLogo(null);
    setLogoPreview(null);
  };

const handleLogoSubmit = async (e) => {
  e.preventDefault();

  if (!companyLogo) {
    setError("Please upload company logo");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const formData = new FormData();

    formData.append("name", signupData.name);
    formData.append("email", signupData.email);
    formData.append("password", signupData.password);
    formData.append("image", companyLogo);

    const { data } = await axios.post(
      `${backendUrl}/api/company/register`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (data.success) {
      localStorage.setItem("companyToken", data.token);
      localStorage.setItem("isRecruiterLoggedIn", "true");
      if (setCompanyToken) setCompanyToken(data.token);
      if (fetchCompanyData) fetchCompanyData();

      toast.success("Company Registered Successfully");

      handleClose();
      navigate("/dashboard");
    } else {
      setError(data.message);
    }
  } catch (error) {
    console.error(error);

    setError(
      error.response?.data?.message || "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};
//  const handleSkipLogo = async () => {
//   try {
//     const formData = new FormData();

//     formData.append("name", signupData.name);
//     formData.append("email", signupData.email);
//     formData.append("password", signupData.password);

//     const { data } = await axios.post(
//       "http://localhost:5000/api/company/register",
//       formData
//     );

//     if (data.success) {
//       localStorage.setItem("companyToken", data.token);

//       handleClose();

//       navigate("/dashboard");
//     }
//   } catch (error) {
//     setError(error.response?.data?.message || "Something went wrong");
//   }
// };

  // ---------- Shared bits ----------

  const titles = {
    login: "Recruiter Login",
    signup: "Recruiter Signup",
    "forgot-email": "Forgot Password",
    "forgot-otp": "Verify OTP",
    "forgot-reset": "Reset Password",
    "upload-logo": "Company Logo",
  };

  const subtitles = {
    login: "Login to access recruiter dashboard",
    signup: "Create a recruiter account",
    "forgot-email": "Enter your email to receive an OTP",
    "forgot-otp": `Enter the 6-digit code sent to ${forgotEmail || "your email"}`,
    "forgot-reset": "Set a new password for your account",
    "upload-logo": "Add your company logo to complete your profile",
  };

  return (

    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl w-[420px] p-8">

        <div className="flex justify-between items-center">

          <h2 className="text-2xl font-bold">
            {titles[view]}
          </h2>

          <button
            onClick={handleClose}
            className="text-3xl leading-none"
          >
            ×
          </button>

        </div>

        <p className="text-gray-500 mt-2">
          {subtitles[view]}
        </p>

        {info && (
          <p className="text-green-600 text-sm mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            {info}
          </p>
        )}

        {error && (
          <p className="text-red-500 text-sm mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        {/* ---------------- LOGIN ---------------- */}

        {view === "login" && (

          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="you@company.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="text-right">
              <span
                className="text-sm text-blue-600 cursor-pointer"
                onClick={() => switchView("forgot-email")}
              >
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              onClick={() => console.log("Clicked")}
            >
              Login
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              New recruiter?{" "}
              <span
                className="text-blue-600 cursor-pointer font-medium"
                onClick={() => switchView("signup")}
              >
                Create an account
              </span>
            </p>

          </form>

        )}

        {/* ---------------- SIGNUP ---------------- */}

        {view === "signup" && (

          <form onSubmit={handleSignupSubmit} className="mt-6 space-y-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={signupData.name}
                onChange={handleSignupChange}
                placeholder="Your full name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium mb-1">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={signupData.company}
                onChange={handleSignupChange}
                placeholder="Company name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleSignupChange}
                placeholder="you@company.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={signupData.password}
                onChange={handleSignupChange}
                placeholder="Create a password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  placeholder="Re-enter your password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Create Account
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <span
                className="text-blue-600 cursor-pointer font-medium"
                onClick={() => switchView("login")}
              >
                Login
              </span>
            </p>

          </form>

        )}

        {/* ---------------- FORGOT PASSWORD: EMAIL ---------------- */}

        {view === "forgot-email" && (

          <form onSubmit={handleForgotEmailSubmit} className="mt-6 space-y-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                Registered Email
              </label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@company.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              <span
                className="text-blue-600 cursor-pointer font-medium"
                onClick={() => switchView("login")}
              >
                Back to login
              </span>
            </p>

          </form>

        )}

        {/* ---------------- FORGOT PASSWORD: OTP ---------------- */}

        {view === "forgot-otp" && (

          <form onSubmit={handleOtpSubmit} className="mt-6 space-y-4">

            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Didn't receive the code?{" "}
              <span
                className="text-blue-600 cursor-pointer font-medium"
                onClick={handleResendOtp}
              >
                Resend OTP
              </span>
            </p>

            <p className="text-center text-sm text-gray-500">
              <span
                className="text-blue-600 cursor-pointer font-medium"
                onClick={() => switchView("forgot-email")}
              >
                Change email
              </span>
            </p>

          </form>

        )}

        {/* ---------------- FORGOT PASSWORD: RESET ---------------- */}

        {view === "forgot-reset" && (

          <form onSubmit={handleResetSubmit} className="mt-6 space-y-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={newPassword.password}
                onChange={handleNewPasswordChange}
                placeholder="Enter new password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={newPassword.confirmPassword}
                  onChange={handleNewPasswordChange}
                  placeholder="Re-enter new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Reset Password
            </button>

          </form>

        )}

        {/* ---------------- COMPANY LOGO UPLOAD ---------------- */}

        {view === "upload-logo" && (

          <form onSubmit={handleLogoSubmit} className="mt-6">

            <div className="border-2 border-dashed rounded-lg p-10 text-center">

              {logoPreview ? (

                <>
                  <img
                    src={logoPreview}
                    alt="Company logo preview"
                    className="mx-auto max-h-24 object-contain"
                  />

                  <p className="font-semibold mt-4">
                    {companyLogo.name}
                  </p>

                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="mt-4 text-sm text-red-600"
                  >
                    Remove
                  </button>
                </>

              ) : (

                <>
                  <p className="text-gray-500">
                    assets.upload_area
                  </p>

                  <label className="cursor-pointer">

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleLogoChange}
                    />

                    <div className="mt-5 bg-blue-600 text-white py-3 rounded-lg">
                      Upload Company Logo
                    </div>

                  </label>
                </>

              )}

            </div>

            <button
              type="submit"
              className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Save and Continue
            </button>

            {/* <p className="text-center text-sm text-gray-500 mt-4">
              <span
                className="text-blue-600 cursor-pointer font-medium"
                onClick={handleSkipLogo}
              >
                Skip for now
              </span>
            </p> */}

          </form>

        )}

      </div>

    </div>

  );
};

export default RecruiterLogin;