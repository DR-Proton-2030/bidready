import { useState, useCallback } from "react";

export interface UseOtpVerificationOptions {
  onSuccess?: (otp: string) => void;
  onError?: (error: string) => void;
  onResend?: () => void;
}

export const useOtpVerification = (options?: UseOtpVerificationOptions) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const openOtpModal = useCallback((userEmail: string) => {
    setEmail(userEmail);
    setIsModalOpen(true);
    setOtpError("");
  }, []);

  const closeOtpModal = useCallback(() => {
    setIsModalOpen(false);
    setOtpError("");
    setIsVerifying(false);
  }, []);

  const verifyOtp = useCallback(async (otp: string) => {
    setIsVerifying(true);
    setOtpError("");

    try {
      // For now, we'll use a simple check for "1234"
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      if (otp === "1234") {
        setIsModalOpen(false);
        options?.onSuccess?.(otp);
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Verification failed. Please try again.";
      setOtpError(errorMessage);
      options?.onError?.(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  }, [options]);

  const resendOtp = useCallback(async () => {
    try {
      // TODO: Replace with actual API call to resend OTP
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setOtpError("");
      options?.onResend?.();
      
      // For demo purposes, show a temporary success message
      console.log("OTP resent successfully to", email);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to resend OTP. Please try again.";
      setOtpError(errorMessage);
      options?.onError?.(errorMessage);
    }
  }, [email, options]);

  return {
    isModalOpen,
    isVerifying,
    otpError,
    email,
    openOtpModal,
    closeOtpModal,
    verifyOtp,
    resendOtp,
  };
};
