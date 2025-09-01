"use client";

import React, { useState } from "react";
import CompanyLogo from "@/components/shared/companyLogo/CompanyLogo";
import PrimaryButton from "@/components/shared/buttons/primaryButton/PrimaryButton";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "@/components/shared/form/passwordInput/PasswordInput";
import { api } from "@/utils/api";
const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const passwordInput = {
    id: "password",
    label: "Password",
    type: "password",
    placeHolder: "Enter your password",
    name: "password",
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password Submitted", password);

    if (password != confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const payload = { userId:email, newPassword:password };
      setIsLoading(true);
      const result = await api.auth.changePassword(payload);
      if (result) {
        alert("Password Changed");
        router.push("/login");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="align-middle-items min-h-screen bg-background">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <CompanyLogo />

        <h2 className="text-center text-xl font-semibold text-gray-90 mt-4">
          Reset Your Password
        </h2>

        <form
          onSubmit={handleSubmit}
          className="p-4 max-w-sm mx-auto flex flex-col gap-8"
        >
          <div>
            <PasswordInput
              input={passwordInput}
              value={password}
              handleChange={handlePasswordChange}
              placeholder="Enter new password"
            />
            <PasswordInput
              input={passwordInput}
              value={confirmPassword}
              handleChange={handleConfirmPasswordChange}
              placeholder="Enter the password again"
            />
          </div>

          <PrimaryButton text="Reset Password" />
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
