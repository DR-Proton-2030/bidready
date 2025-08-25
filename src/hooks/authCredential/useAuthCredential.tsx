import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import AuthContext from "@/contexts/authContext/authContext";
import { api } from "@/utils/api";

const useAuthCredential = () => {
  const { setUser } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginCredential, setLoginCredential] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setLoginCredential((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsLoading(true);
      const result = await api.auth.loginUser(loginCredential);
      if (result) {
        const { token, user } = result;
        setUser(user);
        router.push("/dashboard");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUserCreadintial = async () => {
    const result = await api.auth.logoutUser();
    console.log("result===>", result);
    setUser(null);
    router.push("/login");
  };
  return {
    loginCredential,
    handleChange,
    handleSubmit,
    handleLogout: logoutUserCreadintial,
    isLoading,
  };
};

export default useAuthCredential;
