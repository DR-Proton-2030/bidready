"use client";
import React from "react";
import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={`relative ${
              stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
            } flex-1`}
          >
            {/* Connector Line */}
            {stepIdx !== steps.length - 1 ? (
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div
                  className={`h-0.5 w-full ${
                    completedSteps.includes(step.id) || currentStep > step.id
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                />
              </div>
            ) : null}

            {/* Step Circle */}
            <button
              onClick={() => onStepClick?.(step.id)}
              className={`
                relative flex h-10 w-10 items-center justify-center rounded-full
                ${
                  completedSteps.includes(step.id)
                    ? "bg-blue-600 hover:bg-blue-700"
                    : currentStep === step.id
                    ? "border-2 border-blue-600 bg-white"
                    : "border-2 border-gray-300 bg-white hover:border-gray-400"
                }
                ${onStepClick ? "cursor-pointer" : "cursor-default"}
                transition-colors duration-200
              `}
              disabled={!onStepClick}
            >
              {completedSteps.includes(step.id) ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <span
                  className={`text-sm font-semibold ${
                    currentStep === step.id ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step.id}
                </span>
              )}
            </button>

            {/* Step Label */}
            <div className="mt-3 text-center">
              <div
                className={`text-sm font-medium ${
                  currentStep === step.id
                    ? "text-blue-600"
                    : completedSteps.includes(step.id)
                    ? "text-gray-900"
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-500 mt-1 max-w-24">
                {step.description}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Stepper;
