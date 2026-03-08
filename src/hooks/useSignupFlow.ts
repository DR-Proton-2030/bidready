import { useCallback } from "react";
import { useSignupForm } from "./useSignupForm";
import { useFormValidation } from "./useFormValidation";
import { useFileUpload } from "./useFileUpload";
import { useStepper } from "./useStepper";
import { useSignup, UseSignupOptions } from "./useSignup";
import { useOtpVerification } from "./useOtpVerification";

const TOTAL_STEPS = 2;
const STEP_NAMES = ["User Details", "Company Info"];

export const useSignupFlow = (options?: UseSignupOptions) => {
  // Initialize all hooks
  const { formData, handleInputChange, resetForm } = useSignupForm();
  const { errors, validateStep, clearError, setSubmitError } = useFormValidation();
  const { profileFile, companyFile, handleFileSelect, resetFiles } = useFileUpload();
  const {
    currentStep,
    completedSteps,
    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    isLastStep,
    resetStepper,
  } = useStepper(TOTAL_STEPS);
  
  // OTP verification hook — triggers after Step 1, before going to Step 2
  const {
    isModalOpen: isOtpModalOpen,
    isVerifying: isOtpVerifying,
    otpError,
    email: otpEmail,
    openOtpModal,
    closeOtpModal,
    verifyOtp,
    resendOtp,
  } = useOtpVerification({
    type: "signup",
    onSuccess: async () => {
      // OTP verified successfully → proceed to Step 2 (Company Info)
      console.log("OTP verified, proceeding to company details step");
      goToNextStep();
    },
    onError: (error) => {
      console.error("OTP verification failed:", error);
    },
    onResend: () => {
      console.log("OTP resent to:", formData.email);
    },
  });

  const { isLoading, showSuccess, submitSignup, handleSuccessClose } = useSignup({
    ...options,
    onError: (error) => {
      setSubmitError(error);
      options?.onError?.(error);
    },
  });

  // Enhanced input change handler that clears errors
  const handleInputChangeWithValidation = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    handleInputChange(e);
    
    // Clear error when user starts typing
    if (errors[name]) {
      clearError(name);
    }
  }, [handleInputChange, errors, clearError]);

  // Enhanced file select handler
  const handleFileSelectWithValidation = useCallback((
    file: File | null,
    type: 'profile' | 'company'
  ) => {
    handleFileSelect(file, type);
    
    // Clear file-related errors
    if (type === 'profile' && errors.profile_picture) {
      clearError('profile_picture');
    }
    if (type === 'company' && errors.company_logo) {
      clearError('company_logo');
    }
  }, [handleFileSelect, errors, clearError]);

  // Handle next step — on Step 1, open OTP modal first to verify email
  const handleNext = useCallback(() => {
    if (!validateStep(currentStep, formData)) {
      return;
    }

    if (currentStep === 1) {
      // Step 1 → Verify email via OTP before proceeding
      openOtpModal(formData.email);
    } else {
      // Other steps → go directly to next step
      goToNextStep();
    }
  }, [currentStep, formData, validateStep, goToNextStep, openOtpModal]);

  // Handle final form submission — directly creates the account (email already verified)
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    
    if (!validateStep(currentStep, formData)) {
      return;
    }
    
    // Email already verified via OTP in Step 1, proceed directly with signup
    const result = await submitSignup(formData, profileFile.file, companyFile.file);
    if (!result.success) {
      setSubmitError(result.error || "Signup failed. Please try again.");
    }
  }, [currentStep, formData, validateStep, submitSignup, profileFile.file, companyFile.file, setSubmitError]);

  // Reset entire form flow
  const resetAll = useCallback(() => {
    resetForm();
    resetFiles();
    resetStepper();
  }, [resetForm, resetFiles, resetStepper]);

  return {
    // Form data and handlers
    formData,
    handleInputChange: handleInputChangeWithValidation,
    
    // File upload
    profilePreview: profileFile.preview,
    logoPreview: companyFile.preview,
    handleFileSelect: handleFileSelectWithValidation,
    
    // Stepper
    currentStep,
    completedSteps,
    steps: STEP_NAMES,
    isFirstStep,
    isLastStep,
    handleNext,
    handlePrevious: goToPreviousStep,
    
    // Validation
    errors,
    
    // Submission
    isLoading,
    showSuccess,
    handleSubmit,
    handleSuccessClose,
    
    // OTP Verification
    isOtpModalOpen,
    isOtpVerifying,
    otpError,
    otpEmail,
    closeOtpModal,
    verifyOtp,
    resendOtp,
    
    // Utilities
    resetAll,
  };
};
