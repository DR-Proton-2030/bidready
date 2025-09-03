"use client";
import React, { useContext } from "react";
import Form from "@/components/shared/form/Form";
import CompanyLogo from "@/components/shared/companyLogo/CompanyLogo";
import PrimaryButton from "@/components/shared/buttons/primaryButton/PrimaryButton";
import { LoginInputList } from "./LoginInputList";
import useAuthCredential from "@/hooks/authCredential/useAuthCredential";
import GoogleLogin from "@/components/shared/googleLogin/GoogleLogin";
import ForgetPassword from "../forgetPassword/ForgetPassword";
import HaveNoAccount from "./haveNoAccount/HaveNoAccount";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { api } from "@/utils/api";
import { MESSAGE } from "@/constants/api/message";
import AuthContext from "@/contexts/authContext/authContext";
import CompanyContext from "@/contexts/companyContext/companyContext";
import { useRouter } from "next/navigation";
import { c } from "node_modules/framer-motion/dist/types.d-Cjd591yU";

const Login = () => {
  const router = useRouter();
  const { setUser } = useContext(AuthContext);
  const { setCompany } = useContext(CompanyContext);
  const { loginCredential, handleChange, handleSubmit, isLoading } =
    useAuthCredential();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      console.log("Google Token Response:", response);

      const accessToken = response.access_token;
      console.log("Access Token:", accessToken);

      try {
        const res = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log(res);
        const payload = {
          user_details: {
            email: res.data.email,
            password: res.data.sub,
          },
        };
        const response = await api.auth.googleLogin(payload);

        if (response?.token) {
          const { user, company, token, isNew } = response;

          localStorage.setItem("@token", token);

          const userWithCompany = {
            ...user,
            company_details: company,
          };

          setUser(userWithCompany);
          setCompany(company);

          router.push(isNew === false ? "/dashboard" : "/signup");
        }
      } catch (err) {
        console.log(err);
      }
    },
  });

  return (
    <div className="align-middle-items min-h-screen bg-background">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <CompanyLogo />

        <h2 className="text-center text-xl font-semibold text-gray-90 mt-4">
          Login to your profile
        </h2>

        {/* Input Fields */}
        <form className="space-y-2 mt-8" onSubmit={handleSubmit}>
          <Form
            inputList={LoginInputList}
            objectValue={loginCredential}
            handleChange={handleChange}
          />
          {/* <ForgetPassword /> */}
          <div id="forget-password-container">
            <div
              id="forget-password"
              className="flex justify-end text-sm text-gray-600"
            >
              <a href="/forget-password" className="text-primary">
                Forgot Password?
              </a>
            </div>
          </div>

          <HaveNoAccount />
          {isLoading ? (
            <div className="flex justify-center items-center">
              <h3 className="text-gray-500 text-sm mb-2 mr-6">Logging in...</h3>
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <PrimaryButton text="Login" className="mb-4" />
          )}
        </form>

        {/* Google Login Button */}
        {/* <div className="text-center text-gray-500 text-sm my-4">
          Or sign up with Google
        </div> */}
        <GoogleLogin handleGoogleLogin={handleGoogleLogin} />
      </div>
    </div>
  );
};

export default Login;
