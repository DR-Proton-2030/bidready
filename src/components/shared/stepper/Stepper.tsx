"use client";
import React from "react";

interface StepperProps {
  steps: string[];
  currentStep: number;
  completedSteps?: number[];
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  completedSteps = [],
}) => {
  return (
    <div className="w-full py-8">
      {/* Mobile View */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-sm text-gray-500">Step</span>
          <span className="text-lg font-semibold text-primary">{currentStep}</span>
          <span className="text-sm text-gray-500">of {steps.length}</span>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-secondary">{steps[currentStep - 1]}</h3>
        </div>
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = completedSteps.includes(stepNumber);
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300 relative
                    ${
                      isCompleted
                        ? "bg-primary text-white"
                        : isActive
                        ? "bg-primary text-white ring-4 ring-orange-100"
                        : "bg-gray-200 text-gray-600"
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`
                    mt-2 text-xs font-medium text-center max-w-20
                    ${
                      isActive || isCompleted
                        ? "text-primary"
                        : "text-gray-500"
                    }
                  `}
                >
                  {step}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-4">
                  <div
                    className={`
                      h-0.5 transition-all duration-300
                      ${
                        isCompleted || (isActive && stepNumber < currentStep)
                          ? "bg-primary"
                          : "bg-gray-200"
                      }
                    `}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
