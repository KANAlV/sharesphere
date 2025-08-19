"use client";

import { useState } from "react";

interface FormData {
  username: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const [form, setForm] = useState<FormData>({ username: "", email: "", password: "" });
  const [message, setMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Loading...");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Signup successful! Welcome, ${data.user.username}`);
        window.location.href = "/login";
      } else {
        setMessage(data.error || "Error signing up");
      }
    } catch {
      setMessage("Network error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>
        <div className="flex items-center justify-center text-black">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-md w-80 space-y-4"
          >
            <h2 className="text-xl font-bold text-center">Sign Up</h2>

            <input
              type="text"
              name="username"
              placeholder="username"
              value={form.username}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
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
              Sign Up
            </button>

            <p className="text-center text-sm">{message}</p>
          </form>
        </div>
      </div>
    </div>
  );
}
