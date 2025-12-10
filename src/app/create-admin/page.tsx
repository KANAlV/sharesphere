"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type admn = {
  id: string;
  username: string;
  email: string;
  fullname: string;
};

export default function CreateAdminOnly() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [makeAdmin, setMakeAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Promote states
  const [searchUser, setSearchUser] = useState("");
  const [foundUser, setFoundUser] = useState<admn | null>(null);
  const [promoteMsg, setPromoteMsg] = useState("");

  // ---------------- CREATE ACCOUNT ----------------
  async function createAccount() {
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createUser",
          username,
          email,
          password,
          makeAdmin,
        }),
      });

      const data = await res.json();
      setMsg(res.ok ? (makeAdmin ? "Admin account created!" : "User created!") : data.error);
      setTimeout(() => window.location.reload(), 800);
    } catch {
      setMsg("Network error");
    }

    setLoading(false);
  }

  // ---------------- FIND USER ----------------
  async function findUser() {
    setPromoteMsg("");
    setFoundUser(null);

    try {
      const res = await fetch("/api/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "findUser",
          query: searchUser,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPromoteMsg(data.error || "User not found");
        return;
      }

      setFoundUser(data.user);
      setPromoteMsg("User found!");
    } catch {
      setPromoteMsg("Network error");
    }
  }

  // ---------------- PROMOTE USER ----------------
  async function promoteUser() {
    if (!foundUser) return;

    setPromoteMsg("Promoting...");

    try {
      const res = await fetch("/api/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "promoteUser",
          id: foundUser.id,
        }),
      });

      const data = await res.json();
      setPromoteMsg(res.ok ? "User promoted to Admin!" : data.error);
      setTimeout(() => window.location.reload(), 800);
    } catch {
      setPromoteMsg("Network error");
    }
  }

  return (<div className="w-full mt-20 overflow-y-scroll scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600">
    <div className="flex mt-12 lg:mt-20 w-full justify-center items-center">
      <div className="p-6 bg-[#1a1a1a] border border-gray-700 rounded-xl w-[400px] relative">

     <button
  onClick={() => router.push("/administrator")}
  className="text-gray-300 hover:text-white underline text-sm mb-3"
>
  ← Back
</button>


        <h2 className="text-xl font-semibold mb-4">Create Account</h2>

        {/* Create Section */}
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

          {/* Checkbox */}
          <label className="flex items-center gap-2 mt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={makeAdmin}
              onChange={(e) => setMakeAdmin(e.target.checked)}
            />
            <span className="text-gray-300">Promote to Admin</span>
          </label>

          {/* Create Button */}
          <button
            onClick={createAccount}
            disabled={loading}
            className="mt-3 p-2 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 transition"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          {msg && <p className="text-sm mt-2 text-center text-blue-400">{msg}</p>}
        </div>

        {/* Divider (unchanged design) */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="mx-4 px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
            OR
          </span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Promote Section */}
        <h2 className="text-xl font-semibold mt-8 mb-2">Promote Existing User</h2>

        <div className="flex flex-col gap-3">
          <input
            className="p-2 rounded bg-[#111] border border-gray-700 text-gray-200"
            placeholder="Search by username or email"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />

          <button
            onClick={findUser}
            className="p-2 rounded bg-yellow-600 hover:bg-yellow-500 transition"
          >
            Find User
          </button>

          {/* FIX: Prevent upward movement (reserve fixed space) */}
          <div className="min-h-[50px] transition-all">
            {foundUser && (
              <div className="p-3 bg-[#222] rounded border border-gray-700">
                <p className="text-gray-300">
                  <strong>User:</strong> {foundUser.username}
                </p>
                <p className="text-gray-300">
                  <strong>Email:</strong> {foundUser.email}
                </p>

                <button
                  onClick={promoteUser}
                  className="mt-3 p-2 rounded bg-green-600 hover:bg-green-500 transition"
                >
                  Promote to Admin
                </button>
              </div>
            )}
          </div>

          {promoteMsg && (
            <p className="text-sm mt-2 text-center text-yellow-300">
              {promoteMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>);
}
