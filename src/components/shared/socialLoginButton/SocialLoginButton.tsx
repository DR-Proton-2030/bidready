"use client";
import React from "react";

interface SocialLoginButtonProps {
  provider: string;
  icon: React.ReactNode;
  onClick: (provider: string) => void;
  className?: string;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  icon,
  onClick,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(provider)}
      className={`flex items-center justify-center w-12 h-12 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${className}`}
    >
      {icon}
    </button>
  );
};

export default SocialLoginButton;
