"use client";
import React from "react";
import Link from "next/link";
import UserDetailsStep from "./steps/UserDetailsStep";
import CompanyLogo from "@/components/shared/companyLogo/CompanyLogo";
import SuccessAnimation from "@/components/shared/successAnimation/SuccessAnimation";
import CompanyDetailsStep from "./steps/CompanyDetailsStep";
import OtpVerificationModal from "@/components/shared/otpVerificationModal/OtpVerificationModal";
import { useSignupFlow } from "@/hooks";

const STEP_ICONS = [
  // User icon
  <svg key="user" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>,
  // Company icon
  <svg key="company" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>,
];

const STEP_DESCRIPTIONS = [
  "Your personal information",
  "Your organization details",
];

const SignupForm: React.FC = () => {
  const {
    formData,
    handleInputChange,
    profilePreview,
    logoPreview,
    handleFileSelect,
    currentStep,
    completedSteps,
    steps,
    isFirstStep,
    isLastStep,
    handleNext,
    handlePrevious,
    errors,
    isLoading,
    showSuccess,
    handleSubmit,
    handleSuccessClose,
    isOtpModalOpen,
    isOtpVerifying,
    otpError,
    otpEmail,
    closeOtpModal,
    verifyOtp,
    resendOtp,
  } = useSignupFlow();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <UserDetailsStep
            formData={formData}
            profilePreview={profilePreview}
            errors={errors}
            onChange={handleInputChange}
            onFileSelect={(file: File | null) => handleFileSelect(file, 'profile')}
          />
        );
      case 2:
        return (
          <CompanyDetailsStep
            formData={formData}
            logoPreview={logoPreview}
            errors={errors}
            onChange={handleInputChange}
            onFileSelect={(file: File | null) => handleFileSelect(file, 'company')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-3 sm:p-4">
      {/* Main Container */}
      <div className="w-full max-w-[900px] grid grid-cols-1 lg:grid-cols-[260px_1fr] rounded-2xl overflow-hidden shadow-2xl shadow-orange-200/40 signup-main-card animate-fade-in">
        
        {/* LEFT PANEL — Branding & Stepper Navigation */}
        <div className="signup-left-panel relative flex flex-col justify-between p-6 lg:p-7">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/3 rounded-full blur-2xl" />
          </div>
          
          {/* Top: Logo & Title */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-white/90 font-bold text-lg tracking-tight">BidReady</span>
            </div>
            <p className="text-white/60 text-xs mt-0.5 ml-[42px]">Premium Account Setup</p>
          </div>

          {/* Middle: Stepper Navigation */}
          <div className="relative z-10 my-6 lg:my-0">
            <div className="space-y-1">
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = completedSteps.includes(stepNumber);

                return (
                  <div key={index} className="flex items-start gap-4">
                    {/* Step indicator column */}
                    <div className="flex flex-col items-center">
                      <div className={`
                        relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500
                        ${isCompleted 
                          ? 'bg-white text-orange-600 shadow-lg shadow-white/20' 
                          : isActive 
                            ? 'bg-white text-orange-600 shadow-lg shadow-white/25 ring-2 ring-white/30 ring-offset-2 ring-offset-transparent' 
                            : 'bg-white/10 text-white/50 border border-white/15'
                        }
                      `}>
                        {isCompleted ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          STEP_ICONS[index]
                        )}
                        {/* Pulse on active */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-lg bg-white/20 animate-ping" style={{ animationDuration: '2s' }} />
                        )}
                      </div>
                      {/* Connector line */}
                      {index < steps.length - 1 && (
                        <div className={`
                          w-0.5 h-7 mt-1.5 rounded-full transition-all duration-500
                          ${isCompleted ? 'bg-white/60' : 'bg-white/15'}
                        `} />
                      )}
                    </div>
                    {/* Step text */}
                    <div className="pt-1.5">
                      <p className={`
                        font-semibold text-sm transition-all duration-300
                        ${isActive || isCompleted ? 'text-white' : 'text-white/40'}
                      `}>
                        {step}
                      </p>
                      <p className={`
                        text-xs mt-0.5 transition-all duration-300
                        ${isActive || isCompleted ? 'text-white/60' : 'text-white/25'}
                      `}>
                        {STEP_DESCRIPTIONS[index]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom: Footer info */}
          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 bg-white/15 rounded-md flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white/90 font-medium text-xs">Secure & Private</p>
                  <p className="text-white/50 text-[10px]">256-bit SSL encrypted</p>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div 
                  className="bg-white/70 h-1.5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
              <p className="text-white/50 text-[10px] mt-1.5 text-right">Step {currentStep} of {steps.length}</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Form Content */}
        <div className="bg-white flex flex-col">
          {/* Header */}
          <div className="px-6 pt-5 pb-3 sm:px-8 sm:pt-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {currentStep === 1 ? "Create Your Account" : "Company Information"}
                </h1>
                <p className="text-gray-500 text-xs mt-0.5">
                  {currentStep === 1 
                    ? "Let's start with your basic information" 
                    : "Tell us about your organization"
                  }
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`
                      h-2 rounded-full transition-all duration-500
                      ${index + 1 === currentStep 
                        ? 'w-8 bg-orange-500' 
                        : completedSteps.includes(index + 1) 
                          ? 'w-2 bg-orange-400' 
                          : 'w-2 bg-gray-200'
                      }
                    `}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Form Content (scrollable) */}
          <div className="flex-1 overflow-y-auto px-6 py-4 sm:px-8 sm:py-5 custom-scrollbar">
            <div className="step-transition">
              {renderStepContent()}
            </div>
          </div>

          {/* Footer with buttons */}
          <div className="px-6 py-3 sm:px-8 border-t border-gray-100 bg-gray-50/50">
            {/* Submit Error */}
            {errors.submit && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              {/* Back button */}
              {!isFirstStep ? (
                <button
                  onClick={handlePrevious}
                  className="group flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <div />
              )}
              
              {/* Next/Submit button */}
              {!isLastStep ? (
                <button
                  onClick={handleNext}
                  className="group signup-next-btn flex items-center gap-2 px-6 py-2.5 text-sm text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-orange-300/30 hover:shadow-orange-300/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="group signup-next-btn flex items-center gap-2 px-6 py-2.5 text-sm text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-orange-300/30 hover:shadow-orange-300/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      Creating Account
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </>
                  ) : (
                    <>
                      Create Account
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Footer link */}
            <p className="text-center text-gray-500 text-xs mt-3">
              Already have an account?{" "}
              <Link href="/login" className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Success Animation */}
      <SuccessAnimation show={showSuccess} onClose={handleSuccessClose} />
      
      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={closeOtpModal}
        onVerify={verifyOtp}
        isLoading={isOtpVerifying}
        email={otpEmail}
        error={otpError}
        onResendOtp={resendOtp}
      />
    </div>
  );
};

export default SignupForm;
