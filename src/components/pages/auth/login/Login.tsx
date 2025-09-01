"use client";
import React from "react";
import Form from "@/components/shared/form/Form";
import CompanyLogo from "@/components/shared/companyLogo/CompanyLogo";
import PrimaryButton from "@/components/shared/buttons/primaryButton/PrimaryButton";
import { LoginInputList } from "./LoginInputList";
import useAuthCredential from "@/hooks/authCredential/useAuthCredential";
import GoogleLogin from "@/components/shared/googleLogin/GoogleLogin";
import ForgetPassword from "./forgetPassword/ForgetPassword";
import HaveNoAccount from "./haveNoAccount/HaveNoAccount";

const Login = () => {
  const { loginCredential, handleChange, handleSubmit, isLoading } =
    useAuthCredential();

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
            <PrimaryButton text="Login" className="" />
          )}
        </form>

        {/* Google Login Button */}
        <div className="text-center text-gray-500 text-sm my-4">
          Or sign up with Google
        </div>
        <GoogleLogin />
      </div>
    </div>
  );
};

export default Login;
