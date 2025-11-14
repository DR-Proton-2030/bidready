import { assets } from "@/assets";
import Image from "next/image";
import React from "react";

type IGoogleLoginProps = {
  handleGoogleLogin: () => void;
}
const GoogleLogin: React.FC<IGoogleLoginProps> = ({ handleGoogleLogin }) => {
  return (
    <div id="google-button-component">
      <button id="google-button" className="w-full align-middle-items  text-md
      text-black py-2 rounded-full transition border border-gray-500 hover:bg-gray-50"
        onClick={handleGoogleLogin}>
        <Image
          src={assets.icon.google}
          alt="Google"
          width={30}
          height={30}
          className="mr-2"
        />
        Login with Google
      </button>
    </div>
  );
};

export default GoogleLogin;
