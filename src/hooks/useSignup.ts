import { useState, useCallback, useContext } from "react";
import { useRouter } from "next/navigation";
import { ISignupFormData } from "@/@types/interface/signup.interface";
import { api } from "@/utils/api";
import AuthContext from "@/contexts/authContext/authContext";

export interface UseSignupOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useSignup = (options?: UseSignupOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { setUser } = useContext(AuthContext);
  const router = useRouter();

  const submitSignup = useCallback(
    async (
      formData: ISignupFormData,
      profileFile: File | null,
      companyFile: File | null
    ) => {
      setIsLoading(true);

      try {
        // Create FormData for file uploads
        const submitData = new FormData();

        // Append user details and company details as separate JSON strings
        submitData.append(
          "user_details",
          JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            password: formData.password,
            emp_id: formData.emp_id,
          })
        );

        submitData.append(
          "company_details",
          JSON.stringify({
            company_name: formData.company_name,
            website: formData.website,
            role: formData.role,
          })
        );

        // Append files
        if (profileFile) {
          submitData.append("user_avatar", profileFile);
        }
        if (companyFile) {
          submitData.append("company_logo", companyFile);
        }

        // API call
        const response = await api.auth.signupUser(submitData);

        if (response) {
          const { user } = response;
          setUser(user);
          setShowSuccess(true);
          options?.onSuccess?.();
          return { success: true, data: response };
        }

        throw new Error("Signup failed");
      } catch (error: any) {
        const errorMessage =
          error?.message || "Signup failed. Please try again.";
        options?.onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, options, router]
  );

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    router.push("/dashboard");
  }, [router]);

  const resetSignupState = useCallback(() => {
    setIsLoading(false);
    setShowSuccess(false);
  }, []);

  return {
    isLoading,
    showSuccess,
    submitSignup,
    handleSuccessClose,
    resetSignupState,
  };
};
