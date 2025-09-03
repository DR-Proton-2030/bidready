import { assets } from "@/assets";
import Image from "next/image";
import React from "react";
import { useGoogleLogin } from "@react-oauth/google";

const GoogleLogin = ({login}: any) => {
  return (
    <div id="google-button-component">
    <button id="google-button" className="w-full align-middle-items bg-white text-black py-2 rounded-md transition border hover:bg-gray-50" onClick={() => login()}>
      <Image
        src={assets.icon.google}
        alt="Google"
        width={20}
        height={20}
        className="mr-2"
      />
      Login with Google
    </button>
    </div>
  );
};

export default GoogleLogin;
