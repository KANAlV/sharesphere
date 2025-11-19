"use client"
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

  const email = account[0]?.email || "";

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
        className="flex mt-4 px-6"
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
      
      {/* gender window */}
      <div
        onClick={() => showGenderWindow(false)}
        className={`${genderWindow ? "flex" : "hidden"} fixed inset-0 z-50 w-full bg-black/20 items-center justify-center`}
      >
        <div
          className="text-current p-6 border-2 bg-background border-gray-500 rounded-xl shadow-xl w-96"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-lg font-semibold mb-4 ">Select Gender</div>

          <div className="flex px-6 justify-between">
            <div>Male</div>
            <input
              type="radio"
              name="pagetype"
              value="Male"
              checked={genderTemp === "Male"}
              onChange={() => { setGender("Male"); showRefer(false); }}
            />
          </div><br/>

          <div className="flex px-6 justify-between">
            <div>Female</div>
            <input
              type="radio"
              name="pagetype"
              value="Female"
              checked={genderTemp === "Female"}
              onChange={() => { setGender("Female"); showRefer(false); }}
            />
          </div><br/>

          <div className="flex px-6 justify-between">
            <div>Non-binary</div>
            <input
              type="radio"
              name="pagetype"
              value="Non-binary"
              checked={genderTemp === "Non-binary"}
              onChange={() => { setGender("Non-binary"); showRefer(false); }}
            />
          </div><br/>

          <div className="flex px-6 justify-between">
            <div>I prefer not to say</div>
            <input
              type="radio"
              name="pagetype"
              value=""
              checked={genderTemp === ""}
              onChange={() => { setGender(""); showRefer(false); }}
            />
          </div><br/>

          <div className="flex px-6 justify-between">
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

          {/* save btn */}
          <div className="flex mt-4 w-full justify-end-safe">
            <button 
              type="button"
              onClick={() => { checkGender(); showGenderWindow(false); }}
              className="px-6 py-2 bg-[#1F1E3D] rounded-xl"
            >
              save
            </button>
          </div>
        </div>
      </div>

      {/* Password */}
      <div
        onMouseEnter={() => pswrdHover(true)} onMouseLeave={() => pswrdHover(false)}
        className="flex mt-4 px-6"
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
        className="flex mt-4 px-6"
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
      <div className="flex mt-4 px-6">
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
    </>
  );
}