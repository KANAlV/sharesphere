'use client';

import React from "react";
import SignupForm from "@/app/signup/SignupForm";

const SignupPage = () => {
  const handleSignup = async (data: { username: string; email: string; password: string }) => {
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Signup failed");
      }

      alert("Signup successful!");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return <SignupForm onSubmit={handleSignup} />;
};

export default SignupPage;