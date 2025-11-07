"use client";

import Image from "next/image";
import { useState } from "react";

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

export default function AdminLoginPage() {
  const [adminName, setAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminName, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("✅ Login successful! Redirecting...");
        setTimeout(() => (window.location.href = "/admin/dashboard"), 1200);
      } else {
        setMessage(data.message || "❌ Invalid credentials.");
      }
    } catch {
      setMessage("⚠️ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      } min-h-screen flex flex-col md:flex-row transition-all duration-300`}
    >
      {/* Left Section */}
      <div className="md:w-1/2 w-full bg-[#1E1E3F] text-white flex flex-col items-center justify-center p-10">
        <Image src="/sharesphere_logo.png" alt="Logo" width={250} height={250} />
        <h1 className="text-4xl font-bold font-playfair mt-4">Admin Portal</h1>
        <p className="text-center mt-4 text-gray-300 max-w-sm text-lg">
          Manage users, verify content, and oversee the ShareSphere platform.
        </p>
      </div>

      {/* Right Section */}
      <div className="md:w-1/2 w-full flex items-center justify-center p-6 relative">
        {/* Dark/Light Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-colors duration-200 ${
            darkMode
              ? "border-gray-600 hover:bg-gray-800 text-yellow-400"
              : "border-gray-300 hover:bg-gray-200 text-gray-700"
          }`}
          aria-label="Toggle theme"
        >
          {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>

        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-md space-y-4 relative ${
            darkMode ? "text-gray-200" : "text-gray-800"
          }`}
        >
          <div className="relative text-center">
            <p
              onClick={() => (window.location.href = "/login")}
              className={`absolute -top-3 left-3 flex items-center gap-1 text-sm font-medium cursor-pointer transition-colors duration-200
                ${darkMode 
                  ? "text-gray-300 hover:text-blue-400" 
                  : "text-gray-700 hover:text-blue-600"}
                sm:left-5 md:left-8 lg:left-10
              `}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                fill="currentColor"
                className="w-3 h-3"
              >
                <path d="M9.4 233.4l160-160c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L77.3 224H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H77.3l137.4 105.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3z" />
              </svg>
              Back
            </p>

            <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
          </div>

          <input
            type="text"
            name="adminName"
            placeholder="Username"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            className={`border p-3 w-full rounded ${
              darkMode
                ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-black placeholder-gray-500"
            }`}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`border p-3 w-full rounded ${
                darkMode
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-black placeholder-gray-500"
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-blue-500"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition duration-200"
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>

          {message && (
            <p
              className={`text-center text-sm mt-2 ${
                message.startsWith("✅") ? "text-green-500" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function SunIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
      <path d="M256 128a128 128 0 100 256 128 128 0 000-256zM256 0c17.7 0 32 14.3 32 32v32a32 32 0 11-64 0V32c0-17.7 14.3-32 32-32zM256 480a32 32 0 0132 32v32a32 32 0 01-64 0v-32a32 32 0 0132-32zm256-224a32 32 0 01-32 32h-32a32 32 0 010-64h32a32 32 0 0132 32zM96 256a32 32 0 01-32 32H32a32 32 0 010-64h32a32 32 0 0132 32z" />
    </svg>
  );
}

function MoonIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor">
      <path d="M223.5 32c-27.2 0-53.3 5.6-77.1 15.8C79.3 79.8 32 142.9 32 217.1c0 97.2 78.8 176 176 176 74.2 0 137.3-47.3 169.3-114.4 10.2-23.8 15.8-49.9 15.8-77.1 0-26.4-5.4-51.4-15.1-74.2C363 68.9 296.8 32 223.5 32z" />
    </svg>
  );
}
