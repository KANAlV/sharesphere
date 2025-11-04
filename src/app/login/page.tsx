"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

// ✅ Import your custom SVG files here (place them in /public or /assets if needed)
import EyeIcon from "@/public/icons/eye.svg";
import EyeSlashIcon from "@/public/icons/eye-slash.svg";
import SunIcon from "@/public/icons/sun.svg";
import MoonIcon from "@/public/icons/moon.svg";

interface FormData {
  usernameEmail: string;
  password: string;
}

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
          {darkMode ? (
            <SunIcon className="w-6 h-6 fill-yellow-400" />
          ) : (
            <MoonIcon className="w-6 h-6 fill-gray-600" />
          )}
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
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5 fill-current" />
              ) : (
                <EyeIcon className="w-5 h-5 fill-current" />
              )}
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
