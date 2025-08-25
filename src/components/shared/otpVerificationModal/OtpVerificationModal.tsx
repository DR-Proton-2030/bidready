"use client";
import React, { useState, useRef, useEffect } from "react";
import Modal from "../modal/Modal";
import PrimaryButton from "../buttons/primaryButton/PrimaryButton";

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  isLoading?: boolean;
  email?: string;
  error?: string;
  onResendOtp?: () => void;
}

const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  isLoading = false,
  email,
  error,
  onResendOtp,
}) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOpen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, timeLeft]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(["", "", "", ""]);
      setTimeLeft(120);
      setCanResend(false);
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (index === 3 && value && newOtp.every(digit => digit)) {
      const otpString = newOtp.join("");
      setTimeout(() => onVerify(otpString), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    
    if (pastedData.length >= 4) {
      const newOtp = pastedData.slice(0, 4).split("");
      setOtp(newOtp);
      
      // Auto-submit if complete
      if (newOtp.length === 4) {
        setTimeout(() => onVerify(newOtp.join("")), 100);
      }
    }
  };

  const handleVerify = () => {
    const otpString = otp.join("");
    if (otpString.length === 4) {
      onVerify(otpString);
    }
  };

  const handleResend = () => {
    if (canResend && onResendOtp) {
      onResendOtp();
      setTimeLeft(120);
      setCanResend(false);
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isOtpComplete = otp.every(digit => digit);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Your Email"
      size="md"
      closeOnOverlayClick={false}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-600 mb-2">
            We've sent a 4-digit verification code to
          </p>
          <p className="font-semibold text-secondary">{email}</p>
          <p className="text-sm text-gray-500 mt-2">
            Enter the code below to continue
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center space-x-4 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`
                w-14 h-14 text-center text-xl font-semibold
                border-2 rounded-lg transition-all duration-200
                ${digit 
                  ? 'border-primary bg-orange-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                focus:border-primary focus:ring-2 focus:ring-orange-100 focus:outline-none
                ${error ? 'border-red-300' : ''}
              `}
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Timer and Resend */}
        <div className="mb-6">
          {!canResend ? (
            <p className="text-sm text-gray-500">
              Resend code in{" "}
              <span className="font-medium text-primary">
                {formatTime(timeLeft)}
              </span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
              disabled={isLoading}
            >
              Resend verification code
            </button>
          )}
        </div>

        {/* Verify Button */}
        <PrimaryButton
          text={isLoading ? "Verifying..." : "Verify & Continue"}
          onClick={handleVerify}
          disabled={!isOtpComplete || isLoading}
          className="w-full"
          icon={
            isLoading ? (
              <div className="w-4 h-4 ml-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )
          }
        />

        {/* Help Text */}
        <div className="mt-4 text-sm text-gray-500">
          <p>Didn't receive the code?</p>
          <p>Check your spam folder or contact support</p>
        </div>
      </div>
    </Modal>
  );
};

export default OtpVerificationModal;
