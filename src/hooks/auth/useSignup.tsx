"use client";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { SignupFormData } from "@/@types/auth/signup.interface";
import { api } from "@/utils/api";
import AuthContext from "@/contexts/authContext/authContext";

export const useSignup = () => {
  const [signupData, setSignupData] = useState<SignupFormData>({
    fullName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const { setUser } = useContext(AuthContext);
  const router = useRouter();

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setSignupData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupFormData> = {};

    if (!signupData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!signupData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!signupData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (signupData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Build FormData for signup API
      const submitData = new FormData();
      submitData.append(
        "user_details",
        JSON.stringify({
          full_name: signupData.fullName,
          email: signupData.email,
          password: signupData.password,
        })
      );
      submitData.append(
        "company_details",
        JSON.stringify({
          company_name: "",
          website: "",
          role: "",
        })
      );

      const response = await api.auth.signupUser(submitData);
      
      if (response) {
        const { user, token } = response;
        
        // Store token (matching login flow)
        if (token) {
          localStorage.setItem("@token", token);
          document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
        }

        setUser(user);
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const message = error?.message || "Signup failed. Please try again.";
      setErrors(prev => ({ ...prev, email: message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    
    try {
      console.log(`Signing up with ${provider}`);
      // Social login is handled by the GoogleLogin component directly
    } catch (error) {
      console.error(`${provider} signup error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signupData,
    isLoading,
    errors,
    handleInputChange,
    handleSubmit,
    handleSocialLogin,
  };
};
