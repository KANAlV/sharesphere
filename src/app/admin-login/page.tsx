"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

// ==================== INLINE ICONS ======================
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className="w-5 h-5">
    <path d="M572.52 241.4C518.8 135.7 407.8 64 288 64S57.2 135.7 3.48 241.4a48.3 48.3 0 000 29.1C57.2 376.3 168.2 448 288 448s230.8-71.7 284.5-177.4a48.3 48.3 0 000-29.2zM288 400c-79.4 0-144-64.6-144-144s64.6-144 144-144 144 64.6 144 144-64.6 144-144 144z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className="w-5 h-5">
    <path d="M634 471L38 3C30-3 18-1 12 7S1 26 9 33l596 468c8 6 20 5 27-3s5-20-3-27zM320 400c-79 0-144-65-144-144 0-27 8-53 21-75l52 41a80 80 0 00107 107l41 52c-22 13-48 21-75 21zM320 112c79 0 144 65 144 144 0 27-8 53-21 75l-52-41a80 80 0 00-107-107l-41-52c22-13 48-21 75-21z" />
  </svg>
);

/*ADMIN LOGIN PAGE COMPONENT*/

export default function AdminLoginPage() {
  const [usernameEmail, setUsernameEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [otpEmail, setOtpEmail] = useState("");

  const [cooldown, setCooldown] = useState(0);

  /* LOGIN SUBMIT */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameEmail, password }),
      });

      const data = await res.json();

      /* MODAL APPEARS IF USER HAS auth == TRUE */
      
      if (res.ok && data.auth === true) {
        setShowOtpModal(true);
        setOtpEmail(data.email);
        setOtpMessage("Your account requires OTP verification.");
        setCooldown(180);
        return;
      }

      if (res.ok && data.success) {
        setMessage("Login successful! Redirecting...");
        setTimeout(() => (window.location.href = "/"), 1200);
      } else if (data.otp_required) {
        setOtpEmail(data.email);
        setShowOtpModal(true);
        setOtpMessage("OTP has been sent to your email.");
        setCooldown(180);
      } else {
        setMessage(data.message || "Invalid credentials.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* OTP VERIFY HANDLER */
  const handleOtpVerify = async () => {
    setOtpMessage("Verifying...");

    const res = await fetch("/api/admin-login", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: otpEmail, otp }),
    });

    const data = await res.json();

    if (res.ok) {
      setOtpMessage("Success! Redirecting...");
      window.location.href = "/";
    } else {
      setOtpMessage(data.error || "Invalid code");
    }
  };

  /* RESEND OTP TIMER */
  
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((v) => v - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  
  /* RESEND OTP */
  const handleResendOtp = async () => {
    if (cooldown > 0) return;

    setOtpMessage("Sending new OTP...");

    const res = await fetch("/api/admin-login", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: otpEmail }),
    });

    const data = await res.json();

    if (res.ok) {
      setOtpMessage("New OTP sent!");
      setCooldown(180);
    } else {
      setOtpMessage(data.error || "Failed to send OTP");
    }
  };

  return (
    <>
      {/* MAIN LAYOUT */}
      <div className="min-h-screen flex w-full flex-col md:flex-row bg-gray-100 text-black">

        {/* LEFT SIDE */}
        <div className="md:w-1/2 w-full bg-[#1E1E3F] text-white flex flex-col items-center justify-center p-10">
          <Image src="/sharesphere_logo.png" alt="Logo" width={250} height={250} />
          <h1 className="text-4xl font-bold mt-4">Admin Portal</h1>
          <p className="text-center mt-4 max-w-sm text-lg">
            Manage users, verify content, and oversee the ShareSphere platform.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="md:w-1/2 w-full flex items-center justify-center p-6 relative">

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">

            {/* Back to Login */}
<p
  onClick={() => (window.location.href = "/login")}
  className="text-sm font-medium cursor-pointer flex items-center gap-1 text-gray-600 hover:text-blue-600 mb-2"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    fill="currentColor"
    className="w-3 h-9"
  >
    <path d="M9.4 233.4l160-160c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L77.3 224H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H77.3l137.4 105.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3z" />
  </svg>
  Back to Login
</p>


            <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>

            {/* Username */}
            <input
              type="text"
              placeholder="Username or Email"
              value={usernameEmail}
              onChange={(e) => setUsernameEmail(e.target.value)}
              className="border p-3 w-full rounded bg-white border-gray-300 text-black"
              required
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-3 w-full rounded bg-white border-gray-300 text-black"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-blue-500"
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>

            {message && (
              <p className={`text-center text-sm ${message.startsWith("Login") ? "text-green-600" : "text-red-500"}`}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* OTP MODAL */}
      {showOtpModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowOtpModal(false)}
        >
          <div
            className="p-6 rounded-lg shadow-lg w-80 bg-white text-black"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-3 text-center">Enter OTP Code</h3>

            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => /^[a-zA-Z0-9]*$/.test(e.target.value) && setOtp(e.target.value)}
              className="border p-3 w-full rounded text-center tracking-widest text-lg bg-gray-100 border-gray-300 text-black placeholder-gray-500"
              placeholder="••••••"
            />

            <button
              onClick={handleOtpVerify}
              className="w-full bg-blue-600 text-white mt-4 py-2 rounded hover:bg-blue-700"
            >
              Verify Code
            </button>

            <button
              onClick={handleResendOtp}
              disabled={cooldown > 0}
              className={`w-full text-sm mt-3 ${
                cooldown > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-500 hover:underline"
              }`}
            >
              {cooldown > 0
                ? `Resend OTP (${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")})`
                : "Resend OTP"}
            </button>

            {otpMessage && <p className="text-center mt-2 text-sm text-red-500">{otpMessage}</p>}
          </div>
        </div>
      )}
    </>
  );
}
