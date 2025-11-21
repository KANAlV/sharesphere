"use client"
import { verify } from "crypto";
import { useState, useCallback } from "react";

type Account = {
  id: string;
  email: string;
  auth: boolean;
  gender: string;
}

export default function Account({ account }: { account: Account[] }) {
  const [on, setOn] = useState(account[0]?.auth || false);
  const [loading, setLoading] = useState(false);
  const [eml, emlHover] = useState(false);
  const [pswrd, pswrdHover] = useState(false);
  const [gndr, gndrHover] = useState(false);
  const [genderWindow, showGenderWindow] = useState(false);
  const [refer, showRefer] = useState(false);
  const [genderTemp, setGender] = useState<string>(account[0]?.gender || "prefer not to say");
  const [customGender, setCustomGender] = useState("");
  const [passwordWindow, showPasswordWindow] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailWindow, showEmailWindow] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const email = account[0]?.email || "";

  // --- password change ---
  const checkPassword = async () => {
    if (passwordLoading) return;
    if (newPass !== confirmPass) {
      alert("New password and confirmation do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      const response = await fetch(`/api/settings/updatePassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: account[0].id,
          currentPassword: currentPass,
          newPassword: newPass
        }),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Password updated successfully.");
        showPasswordWindow(false);
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        alert(result.error || "Failed to update password.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPasswordLoading(false);
    }
  };

  // --- gender change ---
  const checkGender = async () => {
    if (loading) return; // prevent multiple clicks
    setLoading(true);

    try {
      const finalGender = genderTemp === "custom" ? customGender : genderTemp;

      const response = await fetch(
        `/api/settings/updateGender?id=${account[0].id}&gender=${encodeURIComponent(finalGender)}`
      );
      const updatedAccount: Account[] = await response.json();

      // Update state to reflect the new gender
      setGender(updatedAccount[0].gender);
      showRefer(updatedAccount[0].gender === customGender);
    } catch (err) {
      console.error("Failed to update gender:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- toggle auth ---
  const twoAuth = useCallback(async () => {
    if (loading) return; // prevent multiple clicks
    setLoading(true);

    try {
      const toggledAuth = await fetch(
        `/api/settings/toggleAuth?id=${account[0].id}&auth=${!on}`
      );
      const newAccount: Account[] = await toggledAuth.json();
      setOn(newAccount[0].auth);
    } catch (err) {
      console.error("Failed to toggle auth:", err);
    } finally {
      setLoading(false);
    }
  }, [on, account, loading]);

  return (
    <>
      {/* Email */}
      <div
        onMouseEnter={() => emlHover(true)} onMouseLeave={() => emlHover(false)}
        onClick={() => showEmailWindow(true)}
        className="flex mt-4 px-6 hover:cursor-pointer"
      >
        <div className="flex w-full justify-between pr-5">
          <div className="content-center-safe">Email address</div>
          <div className="content-center-safe">{email}</div>
        </div>
        <div className={`box-border size-9 rounded-full content-center-safe 
          ${eml ? "bg-gray-500/50":null}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="m-auto" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>

      {/* Password */}
      <div
        onMouseEnter={() => pswrdHover(true)} onMouseLeave={() => pswrdHover(false)}
        onClick={() => showPasswordWindow(!passwordWindow)}
        className="flex mt-4 px-6 hover:cursor-pointer"
      >
        <div className="flex w-full justify-between pr-5">
          <div className="content-center-safe">Password</div>
        </div>
        <div className={`box-border size-9 rounded-full content-center-safe 
          ${pswrd ? "bg-gray-500/50":null}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="m-auto" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>

      {/* Gender */}
      <div
        onMouseEnter={() => gndrHover(true)}
        onMouseLeave={() => gndrHover(false)}
        onClick={() => showGenderWindow(!genderWindow)}
        className="flex mt-4 px-6 hover:cursor-pointer"
      >
        <div className="flex w-full justify-between pr-5">
          <div className="content-center-safe">gender</div>
          <div className="content-center-safe">{genderTemp === "custom" ? customGender : genderTemp}</div>
        </div>
        <div className={`box-border size-9 rounded-full content-center-safe 
          ${gndr ? "bg-gray-500/50":null}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="m-auto" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      </div>

      {/* Two-factor authentication */}
      <div className="flex mt-4 px-6 hover:cursor-pointer">
        <div className="flex w-full justify-between pr-5">
          <div className="content-center-safe">Two-factor authentication</div>
          <div
            onClick={twoAuth}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors
              ${on ? "bg-[#1F1E3D]" : "bg-gray-400"} ${loading ? "opacity-70 cursor-wait" : ""}`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin m-auto"></div>
            ) : (
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform
                  ${on ? "translate-x-6" : "translate-x-0"}`}
              ></div>
            )}
          </div>
        </div>
      </div>

      {/* email window */}
      <div
        onClick={() => showEmailWindow(false)}
        className={`${emailWindow ? "flex" : "hidden"} fixed inset-0 z-50 w-full bg-black/20 items-center justify-center`}
      >
        <div
          className="text-current p-6 border-2 bg-background border-gray-500 rounded-xl shadow-xl w-96 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between">
            <div className="text-lg font-semibold mb-4">Change Email</div>
            {/* Close button */}
            <div onClick={() => showEmailWindow(false)} className="flex justify-center-safe hover:bg-gray-500 rounded-full box-border size-8 hover:cursor-pointer">
              <button
                type="button"
                className="text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          <div className="w-full">
            <input
              name="cpass"
              type="password"
              placeholder="Password"
              value={currentPass}
              onChange={(e) => setVerifyPassword(e.target.value)}
              className="w-full m-1.5 px-2 h-12 border-2 border-gray-500 rounded-2xl"
            />
          </div>

          <div className="w-full">
            <input
              name="email"
              type="email"
              placeholder="New Email"
              value={newPass}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full m-1.5 px-2 h-12 border-2 border-gray-500 rounded-2xl"
            />
          </div>

          {/* save & cancel buttons */}
          <div className="flex mt-4 w-full justify-end-safe gap-2">
            <button 
              type="button"
              onClick={() => showEmailWindow(false)}
              className="px-6 py-2 border-2 border-gray-500 hover:bg-gray-400 text-white rounded-xl hover:cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              className={`px-6 py-2 bg-[#1F1E3D] text-white rounded-xl border-2 border-background hover:cursor-pointer hover:border-gray-500
                          ${passwordLoading ? "opacity-70 cursor-wait" : ""}`}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* password window */}
      <div
        onClick={() => showPasswordWindow(false)}
        className={`${passwordWindow ? "flex" : "hidden"} fixed inset-0 z-50 w-full bg-black/20 items-center justify-center`}
      >
        <div
          className="text-current p-6 border-2 bg-background border-gray-500 rounded-xl shadow-xl w-96 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between">
            <div className="text-lg font-semibold mb-4">Password</div>
            {/* Close button */}
            <div onClick={() => showPasswordWindow(false)} className="flex justify-center-safe hover:bg-gray-500 rounded-full box-border size-8 hover:cursor-pointer">
              <button
                type="button"
                className="text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          <div className="w-full">
            <input
              name="cpass"
              type="password"
              placeholder="Current Password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full m-1.5 px-2 h-12 border-2 border-gray-500 rounded-2xl"
            />
          </div>

          <div className="w-full">
            <input
              name="npass"
              type="password"
              placeholder="New Password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full m-1.5 px-2 h-12 border-2 border-gray-500 rounded-2xl"
            />
          </div>

          <div className="w-full">
            <input
              name="confpass"
              type="password"
              placeholder="Confirm Password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full m-1.5 px-2 h-12 border-2 border-gray-500 rounded-2xl"
            />
          </div>

          {/* save & cancel buttons */}
          <div className="flex mt-4 w-full justify-end-safe gap-2">
            <button 
              type="button"
              onClick={() => showPasswordWindow(false)}
              className="px-6 py-2 border-2 border-gray-500 hover:bg-gray-400 text-white rounded-xl hover:cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={checkPassword}
              className={`px-6 py-2 bg-[#1F1E3D] text-white rounded-xl border-2 border-background hover:cursor-pointer hover:border-gray-500
                          ${passwordLoading ? "opacity-70 cursor-wait" : ""}`}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      
      {/* gender window */}
      <div
        onClick={() => {
          setGender(account[0]?.gender || "prefer not to say"); // restore original gender
          showRefer(false);
          showGenderWindow(false);
        }}
        className={`${genderWindow ? "flex" : "hidden"} fixed inset-0 z-50 w-full bg-black/20 items-center justify-center`}
      >
        <div
          className="text-current p-6 border-2 bg-background border-gray-500 rounded-xl shadow-xl w-96 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between">
            <div className="text-lg font-semibold mb-4">Select Gender</div>
            {/* Close button */}
            <div 
              className="flex justify-center-safe hover:bg-gray-500 rounded-full box-border size-8 hover:cursor-pointer"
              onClick={() => {
                setGender(account[0]?.gender || "prefer not to say"); // restore original
                showRefer(false);
                showGenderWindow(false);
              }}
            >
              <button
                type="button"
                className="text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex px-6 justify-between hover:cursor-pointer">
            <div>Male</div>
            <input
              type="radio"
              name="pagetype"
              value="Male"
              checked={genderTemp === "Male"}
              onChange={() => { setGender("Male"); showRefer(false); }}
            />
          </div><br/>

          <div className="flex px-6 justify-between hover:cursor-pointer">
            <div>Female</div>
            <input
              type="radio"
              name="pagetype"
              value="Female"
              checked={genderTemp === "Female"}
              onChange={() => { setGender("Female"); showRefer(false); }}
            />
          </div><br/>

          <div className="flex px-6 justify-between hover:cursor-pointer">
            <div>Non-binary</div>
            <input
              type="radio"
              name="pagetype"
              value="Non-binary"
              checked={genderTemp === "Non-binary"}
              onChange={() => { setGender("Non-binary"); showRefer(false); }}
            />
          </div><br/>

          <div className="flex px-6 justify-between hover:cursor-pointer">
            <div>I prefer not to say</div>
            <input
              type="radio"
              name="pagetype"
              value=""
              checked={genderTemp === ""}
              onChange={() => { setGender(""); showRefer(false); }}
            />
          </div><br/>

          <div className="flex px-6 justify-between hover:cursor-pointer">
            <div>I refer to myself as:</div>
            <input
              type="radio"
              name="pagetype"
              value="custom"
              checked={refer} // show custom input
              onChange={() => { setGender("custom"); showRefer(true); }}
            />
          </div><br/>

          {/* custom input */}
          <div className={`${refer ? "flex" : "hidden"} ml-4 px-6`}>
            <input
              type="text"
              className="border-2 border-gray-500 w-full"
              value={customGender}
              onChange={(e) => setCustomGender(e.target.value)}
            />
          </div>

          {/* save & cancel buttons */}
          <div className="flex mt-4 w-full justify-end-safe gap-2">
            <button 
              type="button"
              onClick={() => {
                setGender(account[0]?.gender || "prefer not to say"); // restore original
                showRefer(false);
                showGenderWindow(false);
              }}
              className="px-6 py-2 border-2 border-gray-500 hover:bg-gray-400 text-white rounded-xl hover:cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={() => {
                checkGender();
                showGenderWindow(false);
              }}
              className="px-6 py-2 bg-[#1F1E3D] text-white rounded-xl border-2 border-background hover:cursor-pointer hover:border-gray-500"
            >
              Save
            </button>
          </div>
        </div>
      </div>

    </>
  );
}