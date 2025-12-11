"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [isResending, setIsResending] = useState(false);

 
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

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
        setMessage("✅ OTP sent! Check your email.");
        setStep("otp");
        localStorage.setItem("resetEmail", email);

        // Start cooldown (3 minutes)
        setCooldown(180);
      } else {
        setMessage(data.error || "❌ Failed to send OTP.");
      }
    } catch {
      setMessage("❌ Network error.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (loading || isResending || cooldown > 0) return;

    setIsResending(true);
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
        setMessage("🔁 New OTP sent!");
        setCooldown(180); 
      } else {
        setMessage(data.error || "❌ Failed to resend OTP.");
      }
    } catch {
      setMessage("❌ Network error.");
    } finally {
      setLoading(false);
      setIsResending(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsVerifying(true);
  setMessage("");

  try {
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ OTP verified!");
      setStep("reset");
      
    } else {
      setMessage(data.error || "❌ Invalid or expired OTP.");
    }
  } catch {
    setMessage("❌ Network error.");
  } finally {
    setIsVerifying(false);
  }
};

  // Reset Password
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
        setMessage("✅ Password updated! Redirecting...");
        setTimeout(() => (window.location.href = "/login"), 1500);
      } else {
        setMessage(data.error || "❌ Failed to reset password.");
      }
    } catch {
      setMessage("❌ Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 text-black min-h-screen flex flex-col w-full">
      <nav className="flex justify-between items-center px-8 py-4 bg-[#1E1E3F] text-white">
        <div className="flex items-center gap-2">
          <Image src="/sharesphere_logo.png" alt="Logo" width={40} height={40} />
          <h1 className="text-xl font-bold">ShareSphere</h1>
        </div>
        <Link
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Login
        </Link>
      </nav>

      <div className="flex flex-col md:flex-row flex-grow">
        {/* Left Panel */}
        <div className="md:w-1/2 w-full bg-[#1E1E3F] text-white flex flex-col items-center justify-center p-10">
          <Image src="/sharesphere_logo.png" alt="Logo" width={300} height={300} />
          <h1 className="text-4xl font-bold font-playfair mt-4">ShareSphere</h1>
          <p className="text-center mt-4 text-gray-300 max-w-sm text-lg">
            Securely recover your ShareSphere account using OTP verification.
          </p>
        </div>

        {/* Right Panel */}
        <div className="md:w-1/2 w-full flex items-center justify-center p-6">
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

            {/* STEP 1 - Email */}
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
                  className={`w-full py-2 rounded text-white ${
                    loading
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-black hover:bg-gray-800"
                  }`}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            )}

            {/* STEP 2 - OTP */}
            {step === "otp" && (
              <>
                <p className="text-sm text-gray-500">Enter the OTP sent to your email.</p>

                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                 maxLength={6}//length
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                    setOtp(cleaned);
                  }}
                  className="border p-3 w-full rounded"
                  required
                />

                {/* FIXED Verify Button */}
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
                >
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </button>

                {/* Resend OTP button with countdown */}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={cooldown > 0 || loading || isResending}
                  className={`w-full mt-2 py-2 rounded text-white ${
                    cooldown > 0 || isResending
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {cooldown > 0
                    ? `Resend in ${formatTime(cooldown)}`
                    : isResending
                    ? "Resending..."
                    : "Resend OTP"}
                </button>
              </>
            )}

            {/* STEP 3 - Reset Password */}
            {step === "reset" && (
              <>
                <p className="text-sm text-gray-500">Enter your new password below.</p>
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

            {/* Message */}
            {message && (
              <p
                className={`text-center mt-3 text-sm ${
                  message.includes("✅") || message.includes("🔁")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
