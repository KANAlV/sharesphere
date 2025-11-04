"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

interface FormData {
  usernameEmail: string;
  password: string;
}

// ✅ Inline SVG components
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className="w-5 h-5">
    <path d="M572.52 241.4C518.8 135.7 407.8 64 288 64S57.2 135.7 3.48 241.4a48.3 48.3 0 000 29.1C57.2 376.3 168.2 448 288 448s230.8-71.7 284.5-177.4a48.3 48.3 0 000-29.2zM288 400c-79.4 0-144-64.6-144-144s64.6-144 144-144 144 64.6 144 144-64.6 144-144 144z"/>
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className="w-5 h-5">
    <path d="M634 471L38 3C30-3 18-1 12 7S1 26 9 33l596 468c8 6 20 5 27-3s5-20-3-27zM320 400c-79 0-144-65-144-144 0-27 8-53 21-75l52 41a80 80 0 00107 107l41 52c-22 13-48 21-75 21zM320 112c79 0 144 65 144 144 0 27-8 53-21 75l-52-41a80 80 0 00-107-107l-41-52c22-13 48-21 75-21z"/>
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-6 h-6">
    <path d="M256 128a128 128 0 100 256 128 128 0 000-256zm0-128c17.7 0 32 14.3 32 32v32a32 32 0 11-64 0V32c0-17.7 14.3-32 32-32zm0 480a32 32 0 0132 32v32a32 32 0 01-64 0v-32a32 32 0 0132-32zm256-224a32 32 0 01-32 32h-32a32 32 0 010-64h32a32 32 0 0132 32zM96 256a32 32 0 01-32 32H32a32 32 0 010-64h32a32 32 0 0132 32zm307-147a32 32 0 01-45 45l-23-23a32 32 0 1145-45l23 23zm-307 0l23-23a32 32 0 1145 45l-23 23a32 32 0 11-45-45zm307 307a32 32 0 11-45 45l-23-23a32 32 0 1145-45l23 23zm-307 0l23 23a32 32 0 11-45 45l-23-23a32 32 0 1145-45z"/>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" className="w-6 h-6">
    <path d="M223.5 32c-27.2 0-53.3 5.6-77.1 15.8C79.3 79.8 32 142.9 32 217.1c0 97.2 78.8 176 176 176 74.2 0 137.3-47.3 169.3-114.4 10.2-23.8 15.8-49.9 15.8-77.1 0-26.4-5.4-51.4-15.1-74.2C363 68.9 296.8 32 223.5 32z"/>
  </svg>
);

export default function Login() {
  const [form, setForm] = useState<FormData>({ usernameEmail: "", password: "" });
  const [message, setMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "AccessDenied") setMessage("You do not have permission to log in.");
    else if (error === "CredentialsSignin") setMessage("Invalid username/email or password.");
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Loading...");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Login successful! Welcome, ${data.user.username}`);
        window.location.href = "/";
      } else {
        setMessage(data.error || "Error logging in");
      }
    } catch {
      setMessage("Network error");
    }
  };

  const GoogleSignInButton = () => (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded hover:bg-gray-100"
    >
      <Image src="/google.png" alt="Google" width={20} height={20} className="inline-block" />
      <span className="text-gray-700">Sign in with Google</span>
    </button>
  );

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      } min-h-screen flex flex-col md:flex-row`}
    >
      {/* Left Panel */}
      <div className="md:w-1/2 w-full bg-[#1E1E3F] text-white flex flex-col items-center justify-center p-10">
        <Image src="/sharesphere_logo.png" alt="Logo" width={100} height={100} />
        <h1 className="text-4xl font-bold font-playfair mt-4">ShareSphere</h1>
        <p className="text-center mt-4 text-gray-300 max-w-sm text-lg">
          Your Digital Hub for Academic and Creative Collaboration at STI College Alabang.
        </p>
      </div>

      {/* Right Panel */}
      <div className="md:w-1/2 w-full flex items-center justify-center p-6 relative">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-4 right-4 p-2 rounded-full border hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <h2 className="text-2xl font-bold mb-4">Log into ShareSphere</h2>

          <input
            type="text"
            name="usernameEmail"
            placeholder="Email"
            value={form.usernameEmail}
            onChange={handleChange}
            className="border p-3 w-full rounded"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="border p-3 w-full rounded"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="flex justify-between text-sm">
            <Link href="/forgot-password">Forgot Password?</Link>
            <Link href="/signup">Sign Up</Link>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            Log-in
          </button>

          <div className="flex items-center justify-center text-gray-400">
            <span className="mx-2">OR</span>
          </div>

          <GoogleSignInButton />

          <p className="text-center text-sm text-gray-500 mt-2">Log-in as Admin</p>
          {message && <p className="text-center text-red-500">{message}</p>}
        </form>
      </div>
    </div>
  );
}
