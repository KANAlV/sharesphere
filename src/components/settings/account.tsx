"use client";
import { useState, useCallback, useEffect } from "react";

type Account = {
  id: string;
  email: string;
  auth: boolean;
  gender: string;
};

export default function Account({ account }: { account: Account[] }) {
  const [on, setOn] = useState(account[0]?.auth || false);
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const [modalMessage, setModalMessage] = useState("");
  const [modalMessageType, setModalMessageType] = useState<
    "success" | "error" | "info" | ""
  >("");

  const [eml, emlHover] = useState(false);
  const [pswrd, pswrdHover] = useState(false);
  const [gndr, gndrHover] = useState(false);

  const [genderWindow, showGenderWindow] = useState(false);
  const [refer, showRefer] = useState(false);
  const [genderTemp, setGender] = useState<string>(
    account[0]?.gender || "prefer not to say"
  );
  const [customGender, setCustomGender] = useState("");

  const [passwordWindow, showPasswordWindow] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [emailWindow, showEmailWindow] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [otpWindow, setOtpWindow] = useState(false);
  const [otp, setOtp] = useState("");

  const email = account[0]?.email || "";

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  {/* PASSWORD */}
  const checkPassword = async () => {
    if (passwordLoading) return;

    if (newPass !== confirmPass) {
      setModalMessageType("error");
      setModalMessage("New password and confirmation do not match.");
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
          newPassword: newPass,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setModalMessageType("success");
        setModalMessage("Password updated successfully.");
        showPasswordWindow(false);
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        setModalMessageType("error");
        setModalMessage(result.error || "Failed to update password.");
      }
    } catch {
      setModalMessageType("error");
      setModalMessage("Something went wrong while updating password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  {/* GENDER */}
  const checkGender = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const finalGender = genderTemp === "custom" ? customGender : genderTemp;
      const response = await fetch(
        `/api/settings/updateGender?id=${account[0].id}&gender=${encodeURIComponent(
          finalGender
        )}`
      );

      const updatedAccount: Account[] = await response.json();

      setGender(updatedAccount[0].gender);
      showRefer(updatedAccount[0].gender === customGender);

      setModalMessageType("success");
      setModalMessage("Gender updated.");
    } catch {
      setModalMessageType("error");
      setModalMessage("Failed to update gender.");
    } finally {
      setLoading(false);
    }
  };

  {/* 2FA */}
  const twoAuth = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    try {
      const toggledAuth = await fetch(
        `/api/settings/toggleAuth?id=${account[0].id}&auth=${!on}`
      );
      const newAccount: Account[] = await toggledAuth.json();

      setOn(newAccount[0].auth);
      setModalMessageType("success");
      setModalMessage(
        `Two-factor authentication ${newAccount[0].auth ? "enabled" : "disabled"}.`
      );
    } catch {
      setModalMessageType("error");
      setModalMessage("Failed to toggle two-factor authentication.");
    } finally {
      setLoading(false);
    }
  }, [on, account, loading]);

  {/* EMAIL */}
  const updateEmail = async () => {
    if (!verifyPassword || !newEmail) {
      setModalMessageType("error");
      setModalMessage("Please enter password and new email.");
      return;
    }

    setPasswordLoading(true);
    setModalMessage("");
    setModalMessageType("");

    try {
      const res = await fetch("/api/settings/updateEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: account[0].id,
          password: verifyPassword,
          newEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalMessageType("error");
        setModalMessage(data.error || "Failed to send OTP.");
        return;
      }

      showEmailWindow(false);
      setOtpWindow(true);
      setCooldown(180);

      setModalMessageType("info");
      setModalMessage("OTP sent to the new email.");
    } catch {
      setModalMessageType("error");
      setModalMessage("Something went wrong while sending OTP.");
    } finally {
      setPasswordLoading(false);
    }
  };

  {/* OTP VERIFY */}
  const submitOtp = async () => {
    if (!otp) {
      setModalMessageType("error");
      setModalMessage("Enter OTP.");
      return;
    }

    setModalMessage("");
    setModalMessageType("");

    try {
      const res = await fetch("/api/settings/updateEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: account[0].id,
          otp,
          newEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalMessageType("error");
        setModalMessage(data.error || "Invalid or expired OTP.");
        return;
      }

      setModalMessageType("success");
      setModalMessage("Email updated successfully!");

      setTimeout(() => {
        setOtpWindow(false);
        setModalMessage("");
      }, 1500);
    } catch {
      setModalMessageType("error");
      setModalMessage("OTP verification failed.");
    }
  };

  {/* OTP TIMER */}
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  {/* RESEND OTP */}
  const handleResendOTP = async () => {
    if (cooldown > 0) return;

    setResending(true);
    setModalMessage("");
    setModalMessageType("");

    try {
      const res = await fetch("/api/settings/updateEmail", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: account[0].id,
          newEmail,
          invalidate: true,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setModalMessageType("info");
        setModalMessage("A new OTP has been sent.");
        setCooldown(180);
      } else {
        setModalMessageType("error");
        setModalMessage(data.error || "Failed to resend OTP.");
      }
    } catch {
      setModalMessageType("error");
      setModalMessage("Network error.");
    } finally {
      setResending(false);
    }
  };

  {/* BANNER RENDER */}
  const renderModalBanner = () => {
    if (!modalMessage) return <></>;
    const base = "w-full text-sm px-3 py-2 rounded-md mb-3 text-left";

    if (modalMessageType === "success")
      return <div className={`${base} bg-green-100 text-green-800`}>{modalMessage}</div>;
    if (modalMessageType === "error")
      return <div className={`${base} bg-red-100 text-red-800`}>{modalMessage}</div>;
    if (modalMessageType === "info")
      return <div className={`${base} bg-yellow-100 text-yellow-800`}>{modalMessage}</div>;

    return <div className={base}>{modalMessage}</div>;
  };

  return (
    <>
      {/* EMAIL SECTION */}
<div
  onMouseEnter={() => emlHover(true)}
  onMouseLeave={() => emlHover(false)}
  onClick={() => showEmailWindow(true)}
  className="flex mt-4 px-6 hover:cursor-pointer"
>
  <div className="flex w-full justify-between pr-5 items-center">
    <div className="text-sm text-gray-300">Email address</div>

    {/* Long email will now truncate properly */}
    <div className="max-w-[55%] text-right truncate text-sm text-gray-200">
      {email}
    </div>
  </div>

  <div
    className={`box-border size-9 rounded-full flex items-center justify-center ${
      eml ? "bg-gray-500/50" : ""
    }`}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      className="text-gray-300"
    >
      <path d="M9 18l6-6-6-6" stroke="currentColor" fill="none" />
    </svg>
  </div>
</div>


      {/* PASSWORD SECTION */}
      <div
        onMouseEnter={() => pswrdHover(true)}
        onMouseLeave={() => pswrdHover(false)}
        onClick={() => showPasswordWindow(true)}
        className="flex mt-4 px-6 hover:cursor-pointer"
      >
        <div className="flex w-full justify-between pr-5 items-center">
          <div>Password</div>
        </div>

        <div
          className={`box-border size-9 rounded-full flex items-center justify-center
        ${pswrd ? "bg-gray-500/50" : ""}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path d="M9 18l6-6-6-6" stroke="currentColor" fill="none" />
          </svg>
        </div>
      </div>

      {/* GENDER SECTION */}
      <div
        onMouseEnter={() => gndrHover(true)}
        onMouseLeave={() => gndrHover(false)}
        onClick={() => showGenderWindow(true)}
        className="flex mt-4 px-6 hover:cursor-pointer"
      >
        <div className="flex w-full justify-between pr-5 items-center">
          <div>Gender</div>
          <div>{genderTemp === "custom" ? customGender : genderTemp}</div>
        </div>

        <div
          className={`box-border size-9 rounded-full flex items-center justify-center
        ${gndr ? "bg-gray-500/50" : ""}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path d="M9 18l6-6-6-6" stroke="currentColor" fill="none" />
          </svg>
        </div>
      </div>

      {/* TWO AUTH SECTION */}
<div className="flex mt-4 px-6">
  <div className="flex w-full justify-between pr-5 items-center">
    <div>Two-factor authentication</div>

    <div
      onClick={!loading ? twoAuth : undefined}
      className={`
        w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors relative
        ${on ? "bg-[#1F1E3D]" : "bg-gray-500"}
        ${loading ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      {/* LOADING SPINNER INSIDE THE SWITCH */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
            ></path>
          </svg>
        </div>
      )}

      {/* SWITCH CIRCLE */}
      <div
        className={`
          bg-white w-4 h-4 rounded-full shadow-md transform transition-transform
          ${on ? "translate-x-6" : ""}
          ${loading ? "opacity-0" : ""}
        `}
      ></div>
    </div>
  </div>
</div>


      {/* Email Window */}
<div
  onClick={() => showEmailWindow(false)}
  className={`${emailWindow ? "flex" : "hidden"} fixed inset-0 z-50 bg-black/30 items-center justify-center`}
>
  <div
    onClick={(e) => e.stopPropagation()}
    className="p-6 border-2 bg-background border-gray-500 rounded-xl shadow-xl w-96"
  >
    <div className="flex justify-between">
      <div className="text-lg font-semibold mb-4">Change Email</div>
      <button
        onClick={() => showEmailWindow(false)}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-500/40 transition"
      >
        <span className="text-white text-lg font-bold leading-none">×</span>
      </button>
    </div>

    {/* PASSWORD WITH SHOW/HIDE */}
    <div className="relative w-full mb-2">
      <input
        type={showVerifyPassword ? "text" : "password"}
        placeholder="Password"
        value={verifyPassword}
        onChange={(e) => setVerifyPassword(e.target.value)}
        className="w-full px-2 h-12 border-2 border-gray-500 rounded-xl pr-10"
      />

      {/* Eye Icon Button */}
      <button
        type="button"
        onClick={() => setShowVerifyPassword(!showVerifyPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        {showVerifyPassword ? (
          /* 👁️ Eye Open */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-gray-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ) : (
          /* 👁️ Eye Closed */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-gray-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.058 7.028 19 12 19c1.533 0 2.986-.3 4.297-.84M6.228 6.228A10.45 10.45 0 0112 5c4.972 0 8.774 2.942 10.066 7a10.523 10.523 0 01-4.132 5.411M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88"
            />
          </svg>
        )}
      </button>
    </div>

    {/* NEW EMAIL INPUT */}
    <input
      type="email"
      placeholder="New Email"
      value={newEmail}
      onChange={(e) => setNewEmail(e.target.value)}
      className="w-full mb-2 px-2 h-12 border-2 border-gray-500 rounded-xl"
    />

    {/* BUTTONS */}
    <div className="flex justify-end gap-2 mt-4">
      <button
        onClick={() => showEmailWindow(false)}
        className="px-6 py-2 border-2 border-gray-500 text-white rounded-xl"
      >
        Cancel
      </button>
      <button
        onClick={updateEmail}
        className="px-6 py-2 bg-[#1F1E3D] text-white rounded-xl"
      >
        {passwordLoading ? "Sending..." : "Save"}
      </button>
    </div>
  </div>
</div>

      {/* OTP MODAL */}
      <div
        onClick={() => {
          setOtpWindow(false);
          setModalMessage("");
          setModalMessageType("");
        }}
        className={`${otpWindow ? "flex" : "hidden"} fixed inset-0 z-50 bg-black/30 items-center justify-center`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="p-6 border-2 bg-background border-gray-500 rounded-xl shadow-xl w-96"
        >
          <div className="flex justify-between">
            <div className="text-lg font-semibold mb-4">Verify OTP</div>
            <button
              onClick={() => {
                setOtpWindow(false);
                setModalMessage("");
                setModalMessageType("");
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-500/40 transition"
            >
              <span className="text-white text-lg font-bold leading-none">×</span>
            </button>
          </div>

          {renderModalBanner()}

          {/* OTP INPUT */}
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            maxLength={6}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
              setOtp(value);
            }}
            className="w-full mb-2 px-2 h-12 border-2 border-gray-500 rounded-xl text-center tracking-widest"
            autoComplete="off"
          />

          {/* RESEND ROW */}
          <div className="flex items-center justify-between gap-3 mt-2">
            <div className="text-sm text-gray-400 whitespace-nowrap">
              {cooldown > 0 ? `Resend available in ${formatTime(cooldown)}` : "You can resend a new OTP"}
            </div>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending || cooldown > 0}
              className={`py-2 px-4 rounded-md text-white text-sm flex items-center justify-center ${
                cooldown > 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1F1E3D] hover:bg-[#141327]"
              }`}
            >
              {resending ? "Resending..." : cooldown > 0 ? `Resend (${formatTime(cooldown)})` : "Resend OTP"}
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => {
                setOtpWindow(false);
                setModalMessage("");
                setModalMessageType("");
              }}
              className="px-6 py-2 border-2 border-gray-500 text-white rounded-xl"
            >
              Cancel
            </button>

            <button
              onClick={submitOtp}
              className="px-6 py-2 bg-[#1F1E3D] text-white rounded-xl"
            >
              Verify
            </button>
          </div>
        </div>
      </div>

      {/* Password Window */}
<div
  onClick={() => showPasswordWindow(false)}
  className={`${passwordWindow ? "flex" : "hidden"} fixed inset-0 z-50 bg-black/30 items-center justify-center`}
>
  <div
    onClick={(e) => e.stopPropagation()}
    className="p-6 border-2 bg-background border-gray-500 rounded-xl shadow-xl w-96"
  >
    <div className="flex justify-between">
      <div className="text-lg font-semibold mb-4">Password</div>
      <button
        onClick={() => showPasswordWindow(false)}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-500/40 transition"
      >
        <span className="text-white text-lg font-bold leading-none">×</span>
      </button>
    </div>

    {renderModalBanner()}

    {/* Current Password */}
    <div className="relative">
      <input
        type={showCurrent ? "text" : "password"}
        placeholder="Current Password"
        value={currentPass}
        onChange={(e) => setCurrentPass(e.target.value)}
        className="w-full mb-2 px-2 h-12 border-2 border-gray-500 rounded-xl pr-10"
      />

      <button
        type="button"
        onClick={() => setShowCurrent(!showCurrent)}
        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
      >
        {showCurrent ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.477 10.477A3 3 0 0113.5 13.5M6.94 6.94C4.698 8.34 3.17 10.44 2.458 12c1.274 4.057 5.065 7 9.542 7 1.46 0 2.857-.26 4.147-.74M17.06 17.06C19.302 15.66 20.83 13.56 21.542 12c-.72-2.21-2.23-4.19-4.312-5.53" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </div>

    {/* New Password */}
    <div className="relative">
      <input
        type={showNew ? "text" : "password"}
        placeholder="New Password"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
        className="w-full mb-2 px-2 h-12 border-2 border-gray-500 rounded-xl pr-10"
      />

      <button
        type="button"
        onClick={() => setShowNew(!showNew)}
        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
      >
        {showNew ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.477 10.477A3 3 0 0113.5 13.5M6.94 6.94C4.698 8.34 3.17 10.44 2.458 12c1.274 4.057 5.065 7 9.542 7 1.46 0 2.857-.26 4.147-.74M17.06 17.06C19.302 15.66 20.83 13.56 21.542 12c-.72-2.21-2.23-4.19-4.312-5.53" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </div>

    {/* Confirm Password */}
    <div className="relative">
      <input
        type={showConfirm ? "text" : "password"}
        placeholder="Confirm Password"
        value={confirmPass}
        onChange={(e) => setConfirmPass(e.target.value)}
        className="w-full mb-2 px-2 h-12 border-2 border-gray-500 rounded-xl pr-10"
      />

      <button
        type="button"
        onClick={() => setShowConfirm(!showConfirm)}
        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
      >
        {showConfirm ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.477 10.477A3 3 0 0113.5 13.5M6.94 6.94C4.698 8.34 3.17 10.44 2.458 12c1.274 4.057 5.065 7 9.542 7 1.46 0 2.857-.26 4.147-.74M17.06 17.06C19.302 15.66 20.83 13.56 21.542 12c-.72-2.21-2.23-4.19-4.312-5.53" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </div>

    {/* Buttons */}
    <div className="flex justify-end gap-2 mt-4">
      <button
        onClick={() => showPasswordWindow(false)}
        className="px-6 py-2 border-2 border-gray-500 text-white rounded-xl"
      >
        Cancel
      </button>

      <button
        onClick={checkPassword}
        className="px-6 py-2 bg-[#1F1E3D] text-white rounded-xl"
      >
        Save
      </button>
    </div>
  </div>
</div>

      {/* Gender Window */}
      <div
        onClick={() => {
          setGender(account[0]?.gender);
          showRefer(false);
          showGenderWindow(false);
        }}
        className={`${genderWindow ? "flex" : "hidden"} fixed inset-0 z-50 bg-black/30 items-center justify-center`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="p-6 border-2 bg-background border-gray-500 rounded-xl shadow-xl w-96"
        >
          <div className="flex justify-between">
            <div className="text-lg font-semibold mb-4">Select Gender</div>
            <button
              onClick={() => showGenderWindow(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-500/40 transition"
            >
              <span className="text-white text-lg font-bold leading-none">×</span>
            </button>
          </div>

          <div className="flex px-6 justify-between">
            <div>Male</div>
            <input
              type="radio"
              checked={genderTemp === "Male"}
              onChange={() => {
                setGender("Male");
                showRefer(false);
              }}
            />
          </div>
          <br />

          <div className="flex px-6 justify-between">
            <div>Female</div>
            <input
              type="radio"
              checked={genderTemp === "Female"}
              onChange={() => {
                setGender("Female");
                showRefer(false);
              }}
            />
          </div>
          <br />

          <div className="flex px-6 justify-between">
            <div>Non-binary</div>
            <input
              type="radio"
              checked={genderTemp === "Non-binary"}
              onChange={() => {
                setGender("Non-binary");
                showRefer(false);
              }}
            />
          </div>
          <br />

          <div className="flex px-6 justify-between">
            <div>I prefer not to say</div>
            <input
              type="radio"
              checked={genderTemp === ""}
              onChange={() => {
                setGender("");
                showRefer(false);
              }}
            />
          </div>
          <br />

          <div className="flex px-6 justify-between">
            <div>I refer to myself as:</div>
            <input
              type="radio"
              checked={refer}
              onChange={() => {
                setGender("custom");
                showRefer(true);
              }}
            />
          </div>

          <div className={`${refer ? "flex" : "hidden"} px-6 mt-3`}>
            <input
              className="border-2 border-gray-500 w-full rounded-xl px-2"
              value={customGender}
              onChange={(e) => setCustomGender(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => showGenderWindow(false)}
              className="px-6 py-2 border-2 border-gray-500 text-white rounded-xl"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                checkGender();
                showGenderWindow(false);
              }}
              className="px-6 py-2 bg-[#1F1E3D] text-white rounded-xl"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
