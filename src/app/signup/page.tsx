"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SignupPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    otp: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // ⏱️ Cooldown timer for resending OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📩 Handle Signup / Verify OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          step === "signup"
            ? { username: form.username, email: form.email, password: form.password }
            : { email: form.email, otp: form.otp }
        ),
      });

      const data = await res.json();

      if (res.ok) {
        if (step === "signup") {
          setMessage("✅ OTP sent to your email. Please verify.");
          setStep("verify");
        } else {
          setMessage("🎉 Account created successfully! Redirecting...");
          setTimeout(() => (window.location.href = "/login"), 2000);
        }
      } else {
        setMessage(data.error || "❌ Something went wrong.");
      }
    } catch {
      setMessage("⚠️ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Resend OTP
  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setMessage("");
    try {
      const res = await fetch("/api/signup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("🔁 New OTP sent! Please check your email.");
        setCooldown(30);
      } else {
        setMessage(data.error || "❌ Failed to resend OTP.");
      }
    } catch {
      setMessage("⚠️ Network error. Try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-gray-100 text-black min-h-screen flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="md:w-1/2 w-full bg-[#1E1E3F] text-white flex flex-col items-center justify-center p-10">
        <Image src="/sharesphere_logo.png" alt="Logo" width={300} height={300} />
        <h1 className="text-4xl font-bold font-playfair mt-4">ShareSphere</h1>
        <p className="text-center mt-4 text-gray-300 max-w-sm text-lg">
          Join ShareSphere today and connect securely with the world.
        </p>
      </div>

      {/* Right Panel */}
      <div className="md:w-1/2 w-full flex items-center justify-center p-6 relative">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <h2 className="text-2xl font-bold mb-4">
            {step === "signup" ? "Create Account" : "Verify Your Email"}
          </h2>

          {step === "signup" ? (
            <>
              <p className="text-sm text-gray-500">
                Fill out the form below to get started.
              </p>

              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                className="border p-3 w-full rounded"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="border p-3 w-full rounded"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="border p-3 w-full rounded"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
              >
                {loading ? "Sending OTP..." : "Sign Up"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Enter the OTP sent to <span className="font-medium">{form.email}</span>.
              </p>

              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={form.otp}
                onChange={handleChange}
                className="border p-3 w-full rounded text-center tracking-widest"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending || cooldown > 0}
                className={`w-full py-2 rounded mt-2 text-white ${
                  cooldown > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {resending
                  ? "Resending..."
                  : cooldown > 0
                  ? `Resend OTP (${cooldown}s)`
                  : "Resend OTP"}
              </button>
            </>
          )}

          {message && (
            <div
              className={`text-center mt-3 text-sm ${
                message.includes("✅") || message.includes("🎉")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </div>
          )}

          {step === "signup" && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Log in
              </a>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
