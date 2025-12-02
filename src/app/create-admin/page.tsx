"use client";

import { useState } from "react";

export default function CreateAdminOnly() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [makeAdmin, setMakeAdmin] = useState(false); // NEW TOGGLE

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const usernameRegex = /^[A-Za-z0-9]+$/;       // no symbols, no space
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^[A-Za-z0-9]+$/;

  async function createAccount() {
    setMsg("");

    // --- VALIDATIONS ---
    if (!usernameRegex.test(username)) {
      setMsg("Username can only contain letters and numbers (no spaces or symbols).");
      return;
    }

    if (!emailRegex.test(email)) {
      setMsg("Please enter a valid email address (no spaces allowed).");
      return;
    }

    if (!passwordRegex.test(password)) {
      setMsg("Password can only contain letters and numbers (no spaces or symbols).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          makeAdmin: makeAdmin, // SENDS TRUE/FALSE
        }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = { error: "Invalid server response" };
      }

      if (!res.ok) {
        setMsg(data.error || "Failed to create account");
      } else {
        setMsg(
          makeAdmin
            ? "Admin account created successfully!"
            : "User account created successfully!"
        );
      }
    } catch (err) {
      setMsg("Network error");
    }

    setLoading(false);
  }

  return (
    <div className="flex w-full min-h-screen justify-center items-center">
      <div className="p-6 bg-[#1a1a1a] border border-gray-700 rounded-xl w-[400px]">
        <h2 className="text-xl font-semibold mb-4">Create Account</h2>

        <div className="flex flex-col gap-3">
          <input
            className="p-2 rounded bg-[#111] border border-gray-700 text-gray-200"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="p-2 rounded bg-[#111] border border-gray-700 text-gray-200"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="p-2 rounded bg-[#111] border border-gray-700 text-gray-200"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* NEW CHECKBOX */}
          <label className="flex items-center gap-2 mt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={makeAdmin}
              onChange={(e) => setMakeAdmin(e.target.checked)}
            />
            <span className="text-gray-300">Promote to Admin</span>
          </label>

          <button
            onClick={createAccount}
            disabled={loading}
            className="mt-3 p-2 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 transition"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          {msg && (
            <p className="text-sm mt-2 text-center text-blue-400">{msg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
