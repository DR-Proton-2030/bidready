"use client";
import { useState } from "react";

const useTooglePassword = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleTooglePasswordShow = () => {
    setShowPassword(!showPassword);
  };
  return {
    showPassword,
    handleTooglePasswordShow,
  };
};

export default useTooglePassword;
