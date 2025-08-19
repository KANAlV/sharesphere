"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  usernameEmail: string;
  password: string;
}

export default function Login() {
  const [form, setForm] = useState<FormData>({ usernameEmail: "", password: "" });
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

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