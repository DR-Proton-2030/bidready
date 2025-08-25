import { useState, useCallback } from "react";

export const useStepper = (totalSteps: number) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const resetStepper = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps([]);
  }, []);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return {
    currentStep,
    completedSteps,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    resetStepper,
    isFirstStep,
    isLastStep,
  };
};
