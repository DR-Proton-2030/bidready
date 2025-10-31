"use client";
import React from "react";

const ErrorMessage: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return <div className="px-6 py-4 text-red-600 text-sm">{message}</div>;
};

export default ErrorMessage;
