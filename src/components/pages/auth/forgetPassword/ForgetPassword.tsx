"use client";

import React, { useState } from "react";
import CommonInput from "@/components/shared/form/commonInput/CommonInput";
import CompanyLogo from "@/components/shared/companyLogo/CompanyLogo";
import PrimaryButton from "@/components/shared/buttons/primaryButton/PrimaryButton";
import { OtpVerificationModal } from "@/components/shared";
import { useOtpVerification } from "@/hooks/useOtpVerification";
import { useRouter } from "next/navigation";


const ForgetPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  // const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    isModalOpen,
    isVerifying,
    otpError,
    openOtpModal,
    closeOtpModal,
    verifyOtp,
    resendOtp,
  } = useOtpVerification({
    onSuccess: (otp) => {
      console.log("✅ OTP verified successfully:", otp);
      // 👉 Here you can now show the reset password form
      router.push(`/reset-password?email=${email}`)
    },
    onError: (error) => {
      console.error("❌ OTP verification failed:", error);
    },
    onResend: () => {
      console.log("🔄 OTP resent to", email);
    },
  });

  const emailInput = {
    id: "email",
    label: "Email Address",
    type: "email",
    placeHolder: "Enter your email",
    name: "email",
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email Submitted", email);
  };

  return (
    <div className="align-middle-items min-h-screen bg-background">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <CompanyLogo />

        <h2 className="text-center text-xl font-semibold text-gray-90 mt-4">
          Reset Your Password
        </h2>

        <form onSubmit={handleSubmit} className="p-4 max-w-sm mx-auto">
          <CommonInput
            input={emailInput}
            value={email}
            handleChange={handleChange}
          />

          <PrimaryButton
            text="Find Your Account"
            onClick={() => openOtpModal(email)}
          />
        </form>
      </div>

      {isModalOpen && (
        <OtpVerificationModal
          isOpen={isModalOpen}
          onClose={closeOtpModal}
          onVerify={verifyOtp}
          onResendOtp={resendOtp}
          error={otpError}
          email={email}
        />
      )}
    </div>
  );
};

export default ForgetPassword;
