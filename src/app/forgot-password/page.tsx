"use client";

import { useState } from "react";
import Image from "next/image";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");


  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ OTP sent! Please check your email.");
        setStep("otp");
      } else {
        setMessage(data.error || "❌ Failed to send OTP.");
      }
    } catch {
      setMessage("Network error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: "" }), 
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ OTP verified! Now set a new password.");
        setStep("reset");
      } else {
        setMessage(data.error || "❌ Invalid OTP.");
      }
    } catch {
      setMessage("Network error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Password successfully changed!");
        setStep("email");
        setEmail("");
        setOtp("");
        setNewPassword("");
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        setMessage(data.error || "❌ Failed to reset password.");
      }
    } catch {
      setMessage("Network error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      } min-h-screen flex flex-col md:flex-row`}
    >
      
      <div className="md:w-1/2 w-full bg-[#1E1E3F] text-white flex flex-col items-center justify-center p-10">
        <Image src="/sharesphere_logo.png" alt="Logo" width={300} height={300} />
        <h1 className="text-4xl font-bold font-playfair mt-4">ShareSphere</h1>
        <p className="text-center mt-4 text-gray-300 max-w-sm text-lg">
          Securely recover your ShareSphere account using OTP verification.
        </p>
      </div>

     
      <div className="md:w-1/2 w-full flex items-center justify-center p-6 relative">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-4 right-4 p-2 rounded-full border hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? (
            <SunIcon className="w-6 h-6 text-yellow-400" />
          ) : (
            <MoonIcon className="w-6 h-6 text-gray-600" />
          )}
        </button>

        <form
          onSubmit={
            step === "email"
              ? handleSendOTP
              : step === "otp"
              ? handleVerifyOTP
              : handleResetPassword
          }
          className="w-full max-w-md space-y-4"
        >
          <h2 className="text-2xl font-bold mb-4">
            {step === "email"
              ? "Forgot Password"
              : step === "otp"
              ? "Verify OTP"
              : "Reset Password"}
          </h2>

          {step === "email" && (
            <>
              <p className="text-sm text-gray-500">
                Enter your registered email to receive a 6-character OTP.
              </p>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-3 w-full rounded"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <p className="text-sm text-gray-500">
                Enter the OTP sent to your email.
              </p>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="border p-3 w-full rounded"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {step === "reset" && (
            <>
              <p className="text-sm text-gray-500">
                Enter your new password below.
              </p>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border p-3 w-full rounded"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
              >
                {loading ? "Updating..." : "Change Password"}
              </button>
            </>
          )}

          {message && (
            <p className="text-center mt-3 text-sm text-red-500">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
