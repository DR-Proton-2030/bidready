
import { ButtonProps } from "@/@types/props/button.interface";
import React from "react";

const PrimaryButton: React.FC<ButtonProps> = ({
  text,
  className,
  icon,
  onClick,
  disabled
}) => {
  return (
    <div id="primary-button-container">
      <button
        id="primary-button"
        className={`btn-primary flex items-center ${className} ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
        type="submit"
        onClick={onClick}
        disabled={disabled}
      >
        {text}
        {icon}
      </button>
    </div>
  );
};

export default PrimaryButton;
