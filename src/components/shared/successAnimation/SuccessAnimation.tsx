"use client";
import React from "react";

interface SuccessAnimationProps {
  show: boolean;
  onClose: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          {/* Celebration particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-primary rounded-full animate-ping`}
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-secondary mb-2">
          Welcome to BidReady! 🎉
        </h3>
        <p className="text-gray-600 mb-6">
          Your premium account has been created successfully. 
          You can now access all premium features.
        </p>
        
        <button
          onClick={onClose}
          className="btn-primary w-full"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default SuccessAnimation;
