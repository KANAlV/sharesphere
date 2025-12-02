"use client";

import { useEffect, useState } from "react";

export default function AdminList() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const res = await fetch("/api/administrator");
        const data = await res.json();
        setAdmins(data);
      } catch (err) {
        console.error("Fetch admin error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdmins();
  }, []);

  // REMOVE ADMIN ROLE FUNCTION
  const removeAdminRole = async (username: string) => {
    if (!confirm(`Remove admin access for "${username}"?`)) return;

    const res = await fetch("/api/administrator", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (res.ok) {
      alert("Admin role removed.");
      setAdmins((prev) => prev.filter((a) => a.username !== username));
    } else {
      alert("Failed to remove admin role.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-300">
        Loading...
      </div>
    );

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-4/5 max-w-5xl bg-[#111] border border-gray-700 rounded-xl p-6 shadow-xl">

        <h1 className="text-2xl font-semibold mb-4 text-center">
          Admin Accounts
        </h1>

        {/* ➕ CREATE ADMIN BUTTON */}
        <div className="flex justify-end mb-3">
          <button
            onClick={() => (window.location.href = "/create-admin")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            + Create Admin
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-[#222] border-b border-gray-700">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Name</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {admins.map((a, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-800 hover:bg-[#171717]"
                >
                  <td className="p-3">{a.username}</td>
                  <td className="p-3">{a.email}</td>
                  <td className="p-3">{a.fullname || "—"}</td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => removeAdminRole(a.username)}
                      className="p-2 hover:bg-red-600/20 rounded-lg transition"
                      title="Remove admin role"
                    >
                      {/* Trash Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-red-500 hover:text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1m-6 0h6"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {admins.length === 0 && (
            <div className="text-center p-4 text-gray-400">
              No admin accounts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
