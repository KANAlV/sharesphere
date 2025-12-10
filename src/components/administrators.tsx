"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type admn = {
    id:string;
    username:string;
    email:string;
    fullname:string;
    level:number;
    udata:string
}

type Userdata = {
    id: string;
    username: string;
    profile: string;
    level: number;
}

export default function AdminList({userdata}:{userdata:Userdata[] | null}) {
  const [admins, setAdmins] = useState<admn[]>([]);
  const [loading, setLoading] = useState(true);

  const [levelModal, setLevelModal] = useState(false);
  const [adminID, setAdminID] = useState("");
  const [adminName, setAdminName] = useState("");
  const [OGAdminLevel, setOGAdminLevel] = useState(1);
  const [adminLevel, setAdminLevel] = useState(1);
  const router = useRouter();
  useEffect(() => {
    async function checkAdmins() {
      try {
        const res = await fetch("/api/adminChecker");
        const data = await res.json();

        if (!data.isAdmin) {
          router.push("/"); // redirect if not admin
        }
      } catch (err) {
        console.error("Failed to check admin:", err);
        router.push("/"); // fallback redirect
      }
    }

    checkAdmins();

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

  //translate admin level
  function levelTranslate(level:number) {
    let translated;
    switch(level){
      case 1: translated = "Low";
              break;
      case 2: translated = "Middle";
              break;
      case 3: translated = "High";
              break;
    }
    return translated;
  }

  //show level modal
  function editLevel(id:string|null, name:string|null) {
    if(id && name){
        setLevelModal(true);
        setAdminID(id);
        setAdminName(name);
    } else {
        setLevelModal(false);
        setAdminID("");
        setAdminName("name");
    }
  }
  //submit level edit
  async function submitLevel(){
    try {
      const res = await fetch(`/api/administrator/set_level`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin: adminID, level: adminLevel}),
      });

      if (res.ok) {
        alert("Admin level updated successfully!"); 
        window.location.reload();
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to update admin level: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to update admin level:", err);
      alert("An error occurred while updating the admin level.");
    }
  }

return (<>
{/* Modals */}
<div
onClick={() => editLevel(null, null)}
className={`${levelModal?"":"hidden"}
fixed flex justify-center items-center z-30 top-0 right-0 w-screen h-screen bg-black/50`}
>
    <div
    onClick={(e) => e.stopPropagation()}
    className="min-w-50 h-fit p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl"
    >
        <div className="flex justify-between w-full">
            <h1 className="text-xl">Change Level: "{adminName}"</h1>
        </div>

        <div className="w-full text-center">
            <label>Level: </label>
            <select
                name="level"
                id="priority-select"
                value={adminLevel}
                onChange={(e) => setAdminLevel(Number(e.target.value))}
                className="mt-4 px-2 py-2 bg-amber-50 dark:bg-slate-800 border-2 border-gray-500 rounded-xl"
                >
                <option value='1'>Low</option>
                <option value='2'>Middle</option>
                <option value='3'>High</option>
            </select>
        </div>

        <div className={`${adminLevel == OGAdminLevel? "hidden":""} flex pt-4 w-full justify-end`}>
            <button 
            type="button" 
            onClick={() => editLevel(null, null)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg cursor-pointer hover:bg-gray-400"
            >Cancel</button>
            <button 
            type="button"
            onClick={() => submitLevel()} 
            className="ml-4 px-4 py-2 bg-blue-700 text-white rounded-lg cursor-pointer hover:bg-blue-500">Save</button>
        </div>

    </div>
</div>


{/* Main Content */}
  <div
    className="
      min-h-screen
      w-screen
      flex 
      justify-center 
      md:items-center
      px-4           /* Mobile: adds spacing */
      md:px-0        /* Desktop: remove spacing */
      py-24          /* Stops topbar from hiding content */
      md:py-0
      bg-transparent
    "
  >
    <div className="w-full flex justify-center">
      <div className="w-full lg:w-4/5 max-w-5xl bg-[#111] border border-gray-700 rounded-xl p-6 shadow-xl">

        <h1 className="text-2xl font-semibold mb-4 text-center">
          Admin Accounts
        </h1>

        <div className="flex justify-end mb-3">
          <button
            onClick={() => (window.location.href = '/create-admin')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            + Add Admin
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-[#222] border-b border-gray-700">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Name</th>
                <th className="p-3">level</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {admins.map((a, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-[#171717]">
                  <td className="p-3">{a.username}</td>
                  <td className="p-3">{a.email}</td>
                  <td className="p-3">{a.fullname || "—"}</td>
                  <td className="flex p-3">
                    {levelTranslate(a.level) || "—"}
                    <div
                    onClick={() => editLevel(a.id, a.username)}
                    className={`${userdata? (userdata[0].level > a.level? "":(userdata[0].id == a.id?"":"hidden")):"hidden"}
                    px-4`}
                    >
                        <svg className={` cursor-pointer p-1 rounded-full overflow-visible hover:bg-gray-500/50`} width="24" height="24" viewBox="0 -0.5 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="Dribbble-Light-Preview" transform="translate(-99.000000, -400.000000)" fill="currentColor">
                                    <g id="icons" transform="translate(56.000000, 160.000000)">
                                        <path d="M61.9,258.010643 L45.1,258.010643 L45.1,242.095788 L53.5,242.095788 L53.5,240.106431 L43,240.106431 L43,260 L64,260 L64,250.053215 L61.9,250.053215 L61.9,258.010643 Z M49.3,249.949769 L59.63095,240 L64,244.114985 L53.3341,254.031929 L49.3,254.031929 L49.3,249.949769 Z" id="edit-[#1479]" />
                                    </g>
                                </g>
                            </g>
                        </svg>
                    </div>
                </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => {removeAdminRole(a.username), setOGAdminLevel(a.level), setAdminLevel(a.level)}}
                      className={`${userdata? (userdata[0].level > a.level? "":(userdata[0].id == a.id?"":"hidden")):"hidden"}
                      p-2 hover:bg-red-600/20 rounded-lg transition`}
                    >
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
            <div className="text-center p-4 text-gray-400">No admin accounts found.</div>
          )}
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden space-y-3 mt-4">
          {admins.map((a, i) => (
            <div
              key={i}
              className="border border-gray-700 rounded-lg p-4 bg-[#1a1a1a] text-gray-300"
            >
              <div className="mb-1">
                <span className="font-semibold block">Username:</span>
                <span className="break-all">{a.username}</span>
              </div>

              <div className="mb-1">
                <span className="font-semibold block">Email:</span>
                <span className="break-all">{a.email}</span>
              </div>

              <div className="mb-3">
                <span className="font-semibold block">Name:</span>
                <span className="break-all">{a.fullname || "—"}</span>
              </div>

              <div className="mb-3">
                <span className="font-semibold block">Level:</span>
                <span className="break-all">{levelTranslate(a.level)}</span>
              </div>

              <button
                onClick={() => removeAdminRole(a.username)}
                className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg"
              >
                Remove Admin
              </button>
            </div>
          ))}

          {admins.length === 0 && (
            <div className="text-center p-4 text-gray-400">No admin accounts found.</div>
          )}
        </div>

      </div>
    </div>
  </div>
</>);
}