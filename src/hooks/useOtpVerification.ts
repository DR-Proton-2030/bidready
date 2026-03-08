import { api } from "@/utils/api";
import { useState, useCallback } from "react";

export interface UseOtpVerificationOptions {
  type: "signup" | "password-change"; 
  onSuccess?: (otp: string) => void;
  onError?: (error: string) => void;
  onResend?: () => void;
}

export const useOtpVerification = (options?: UseOtpVerificationOptions) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  // Step 1: Open modal and request OTP
  const openOtpModal = useCallback(async (userEmail: string) => {
    try {
      setEmail(userEmail);
      setOtpError("");

      // call backend to generate OTP (OTP is sent via email, not returned)
      const { userId } = await api.auth.getOtp({ email: userEmail, type: options?.type });
      setUserId(userId);

      // Only open modal after OTP is successfully generated
      setIsModalOpen(true);
    } catch (error: any) {
      // Don't open the modal on error — let the caller handle it
      setIsModalOpen(false);
      options?.onError?.(error?.message || "Failed to generate OTP");
    }
  }, [options]);

  const closeOtpModal = useCallback(() => {
    setIsModalOpen(false);
    setOtpError("");
    setIsVerifying(false);
  }, []);

  // Step 2: Verify entered OTP via server-side verification
  const verifyOtp = useCallback(
    async (enteredOtp: string) => {
      setIsVerifying(true);
      setOtpError("");

      try {
        // Verify OTP on the server
        const result = await api.auth.verifyOtp({
          email,
          otp: enteredOtp,
          type: options?.type,
        });

        if (result?.verified) {
          setIsModalOpen(false);
          options?.onSuccess?.(enteredOtp);
        } else {
          setOtpError("Invalid OTP. Please try again.");
        }
      } catch (error: any) {
        const errorMessage =
          error?.message || "Verification failed. Please try again.";
        setOtpError(errorMessage);
        options?.onError?.(errorMessage);
      } finally {
        setIsVerifying(false);
      }
    },
    [email, options]
  );

  // Step 3: Resend OTP
  const resendOtp = useCallback(async () => {
    try {
      const { userId } = await api.auth.getOtp({ email, type: options?.type });
      setUserId(userId);
      setOtpError("");
      options?.onResend?.();
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to resend OTP. Please try again.";
      setOtpError(errorMessage);
      options?.onError?.(errorMessage);
    }
  }, [email, options]);

  return {
    isModalOpen,
    isVerifying,
    otpError,
    email,
    userId,
    openOtpModal,
    closeOtpModal,
    verifyOtp,
    resendOtp,
  };
};

