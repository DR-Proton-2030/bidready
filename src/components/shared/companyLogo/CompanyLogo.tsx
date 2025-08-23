import { assets } from "@/assets";
import Image from "next/image";
import React from "react";

const CompanyLogo = ({ width = 200 }:{ width?: number }) => {
  return (
    <div id="company-logo-container">
      <div id="company-logo" className="flex justify-center ">
        <Image src={assets.images.logo} alt="Logo" width={width} height={10} />
      </div>
    </div>
  );
};

export default CompanyLogo;
