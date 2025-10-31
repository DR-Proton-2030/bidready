"use client";
import React from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
  canProceed?: boolean;
}

const CreateBlueprintStepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepChange,
  children,
  canProceed = true,
}) => {
  const nextStep = () => {
    if (currentStep < steps.length) {
      onStepChange(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || step === currentStep + 1) {
      onStepChange(step);
    }
  };

  return (
    <div className="bg-white">
   

      {/* Step Content */}
      <div className="py-">{children}</div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md transition-all
            ${
              currentStep === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            }
          `}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="text-sm text-gray-500">
          Step {currentStep} of {steps.length}
        </div>

        {currentStep < steps.length ? (
          <button
            type="button"
            onClick={nextStep}
            className={`
              flex items-center space-x-2 px-6 py-2 rounded-md transition-all bg-blue-600 text-white hover:bg-blue-700   
            `}
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default CreateBlueprintStepper;
