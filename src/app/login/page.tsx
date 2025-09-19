"use client";

import Link from "next/link";
import { useState } from "react";

interface FormData {
  usernameEmail: string;
  password: string;
}

export default function Login() {
  const [form, setForm] = useState<FormData>({ usernameEmail: "", password: "" });
  const [message, setMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>
        <form
          onSubmit={handleSubmit}
          className="bg-white text-black p-6 rounded-xl shadow-md w-80 space-y-4"
        >
          <h2 className="text-xl font-bold text-center">Login</h2>

          <input
            type="text"
            name="usernameEmail"
            placeholder="Username or Email"
            value={form.usernameEmail}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>

          <p className="text-center text-sm">{message}</p>
          <p className="text-center text-sm text-gray-500">─────────── OR ────────────</p>
          {/* This is the google log-in*/}
          <button 
            type="submit"
            className="w-full bg-gray-100 text-black py-2 rounded hover:bg-gray-300 justify-between mx-auto p-10 flex flex-wrap">
              <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 48 48"
    className="w-6 h-6"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
            Login with Google
          </button>
        </form>
        <div className="flex items-center justify-center mt-4">
          Don&apos;t have an account?
          <Link href="./signup" className="text-blue-600 hover:text-blue-700 ml-1.5">
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}