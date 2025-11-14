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
    <div className="h-screen overflow-hidden bg-gradient-to-t from-orange-100 via-orange-50 to-white sm:px-38 py-5 ">
      {/* <div className="fixed top-4 left-36">

        <CompanyLogo /
      </div> */}
      <div className="w-full   overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT SECTION - FORM */}
        <div className="px-5 sm:px-16 sm:pt-20 flex flex-col justify-center max-w-lg ">
          <CompanyLogo />
          <h2 className="text-2xl text-center mt-5  text-gray-800 ">
            Login to your profile
          </h2>

          <p className="text-gray-500 text-sm mt-1 text-center">
            Access your dashboard and manage your workspace
          </p>

          <form className="space-y-4 mt-5" onSubmit={handleSubmit}>
            <Form
              inputList={LoginInputList}
              objectValue={loginCredential}
              handleChange={handleChange}
            />

            {/* <div className="flex justify-between items-center text-sm">
              <a href="/forget-password" className="text-gray-500 hover:underline">
                Forgot Password?
              </a>
            </div> */}

            <div className="pt-4">
              {isLoading ? (
                <div className="flex justify-center items-center gap-3">
                  <span className="text-gray-500 text-sm">Logging in...</span>
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <PrimaryButton
                  text="Continue Login"
                  className="w-full bg-orange-500 hover:bg-orange-600 cursor-pointer text-lg text-white/80 py-3 rounded-full transition"
                />
              )}
            </div>
          </form>

          <div className="mt-4">
            <div className="text-center mb-2">Or you can try</div>
            <GoogleLogin handleGoogleLogin={handleGoogleLogin} />
          </div>

          <div className="my-4 text-center mx-auto">
            <HaveNoAccount />
          </div>
        </div>

        {/* RIGHT SECTION – IMAGE PANEL */}
        <div className="relative   md:block rounded-tr-[50px] rounded-br-[50px] rounded-bl-[50px]  overflow-hidden mt-10">

          {/* BACKGROUND IMAGE */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.pexels.com/photos/2678468/pexels-photo-2678468.jpeg')",
            }}
          ></div>


          <div className="absolute top-20 left-20  bg-[#303030] text-gray-900 rounded-xl px-8 py-3 shadow-black/80 -500 shadow-lg">
            <div className="absolute -top-8 right-[38px] bg-[#ffd85f] w-52 rounded-lg px-3 py-3 text-black text-xs shadow-md">
              <div className="absolute top-3 right-3 w-2 h-2 bg-[#303030] rounded-full"></div>

              <div className="text-sm font-semibold">Task Review With Team</div>
              <div className="text-xs mt-1">09:30am - 10:00am</div>
            </div>
            <div className="text-sm font-semibold text-[#303030]">Task Review With Team</div>
            <div className="absolute top-3 right-2 w-2 h-2 bg-[#fff] rounded-full"></div>
            <div className="text-xs mt-1 text-white">09:30am - 10:00am</div>

            {/* Black small bubble behind yellow */}

          </div>

          {/* RIGHT-SIDE AVATAR BUBBLES */}
          <div className="absolute top-40 right-16">
            <div className="relative w-28 h-28">

              {/* Avatar 1 */}
              <img
                src="https://randomuser.me/api/portraits/women/48.jpg"
                className="w-14 h-14 rounded-full  shadow-lg absolute top-0 right-0 rotate-2"
              />

              {/* Avatar 2 */}
              <img
                src="https://randomuser.me/api/portraits/women/12.jpg"
                className="w-14 h-14 rounded-full shadow-lg absolute top-4 right-12 -rotate-2"
              />

              {/* Avatar 3 */}
              <img
                src="https://randomuser.me/api/portraits/women/65.jpg"
                className="w-16 h-16 rounded-full  shadow-xl absolute bottom-0 left-4"
              />

            </div>
          </div>


          {/* CALENDAR BAR */}
          <div className="absolute bottom-36 left-8 bg-white/20 backdrop-blur-2xl rounded-2xl px-8 py-8 shadow-lg text-white/90 flex gap-6">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
              <div key={i} className="text-center">
                <div className="text-">{d}</div>
                <div className="text-xl font-semibold mt-1">
                  {22 + i}
                </div>
              </div>
            ))}

            {/* LAST TWO DAYS SHADED (like image) */}
            <div className="h-full w-16 bg-white/20 rounded-xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            </div>
          </div>

          {/* FLOATING MEETING CARD */}
          <div className="absolute bottom-12 left-8 bg-white rounded-2xl shadow-lg px-5 py-4 w-64">
            <div className="text-sm font-semibold text-gray-800">Daily Meeting</div>
            <div className="text-xs text-gray-500">12:00pm - 01:00pm</div>

            <div className="flex items-center mt-3 -space-x-2">
              <img className="w-8 h-8 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/men/32.jpg" />
              <img className="w-8 h-8 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/women/67.jpg" />
              <img className="w-8 h-8 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/men/73.jpg" />
              <img className="w-8 h-8 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/women/11.jpg" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );

};

export default Login;
