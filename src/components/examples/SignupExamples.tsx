// Example: Using individual hooks for a custom form

import React from "react";
import { useSignupForm, useFormValidation, useStepper, useFileUpload } from "@/hooks";

const CustomSignupExample: React.FC = () => {
  // Use individual hooks for fine-grained control
  const { formData, handleInputChange } = useSignupForm();
  const { errors, validateStep } = useFormValidation();
  const { currentStep, goToNextStep, goToPreviousStep } = useStepper(2);
  const { profileFile, handleFileSelect } = useFileUpload();

  const handleNext = () => {
    if (validateStep(currentStep, formData)) {
      goToNextStep();
    }
  };

  return (
    <div>
      <h2>Custom Signup Form Example</h2>
      <p>Current Step: {currentStep}</p>
      
      {currentStep === 1 && (
        <div>
          <input
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Full Name"
          />
          {errors.full_name && <span className="error">{errors.full_name}</span>}
          
          <input
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
      )}
      
      {currentStep === 2 && (
        <div>
          <input
            name="company_name"
            value={formData.company_name}
            onChange={handleInputChange}
            placeholder="Company Name"
          />
          {errors.company_name && <span className="error">{errors.company_name}</span>}
        </div>
      )}
      
      <button onClick={goToPreviousStep} disabled={currentStep === 1}>
        Previous
      </button>
      <button onClick={handleNext} disabled={currentStep === 2}>
        Next
      </button>
    </div>
  );
};

// Example: Using the main composite hook
import { useSignupFlow } from "@/hooks";

const SimpleSignupExample: React.FC = () => {
  const {
    formData,
    handleInputChange,
    currentStep,
    handleNext,
    handlePrevious,
    errors,
    isFirstStep,
    isLastStep,
  } = useSignupFlow();

  return (
    <div>
      <h2>Simple Signup Form Example</h2>
      <p>Step {currentStep}</p>
      
      {/* Your form fields here */}
      <input
        name="full_name"
        value={formData.full_name}
        onChange={handleInputChange}
        placeholder="Full Name"
      />
      {errors.full_name && <span>{errors.full_name}</span>}
      
      <div>
        {!isFirstStep && <button onClick={handlePrevious}>Previous</button>}
        {!isLastStep && <button onClick={handleNext}>Next</button>}
      </div>
    </div>
  );
};

export { CustomSignupExample, SimpleSignupExample };
