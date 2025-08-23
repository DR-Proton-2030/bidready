import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import AuthContext from "@/contexts/authContext/authContext";

const useAuthCredential = () => {
  const { setUser } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginCredential, setLoginCredential] = useState<{
    username: string;
    password: string;
  }>({
    username: "",
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
      // const result = await api.auth.loginUser(loginCredential);
      // if (result) {
      //   setUser(result);
      //   router.push("/admin");
      // }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUserCreadintial = async () => {
    // const result = await api.auth.logoutUser();
    // console.log("result===>", result);
    // if (result) {
    //   document.cookie =
    //     "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    //   // setUser(null);
    //   router.push("/login");
    // }
  };
  return {
    loginCredential,
    handleChange,
    handleSubmit,
    logoutUserCreadintial,
    isLoading,
  };
};

export default useAuthCredential;
