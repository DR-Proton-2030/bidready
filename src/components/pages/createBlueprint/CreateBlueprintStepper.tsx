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
      {/* Stepper Header */}
      {/* <div className="border-b border-gray-200 pb-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              const isClickable =
                stepNumber <= currentStep || stepNumber === currentStep + 1;

              return (
                <li key={step.id} className="flex items-center">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => isClickable && goToStep(stepNumber)}
                      disabled={!isClickable}
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                        ${
                          isCompleted
                            ? "bg-blue-600 border-blue-600 text-white"
                            : isCurrent
                            ? "border-blue-600 text-blue-600 bg-white"
                            : isClickable
                            ? "border-gray-300 text-gray-400 hover:border-gray-400"
                            : "border-gray-200 text-gray-300 cursor-not-allowed"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">
                          {stepNumber}
                        </span>
                      )}
                    </button>
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-medium ${
                          isCurrent || isCompleted
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {step.description}
                      </span>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`ml-8 w-16 h-0.5 ${
                        isCompleted ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div> */}

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
