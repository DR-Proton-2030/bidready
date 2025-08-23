"use client";
import AuthContext from "@/contexts/authContext/authContext";
import React, { useContext } from "react";

const BottomUserDetails = () => {
  const { user } = useContext(AuthContext);

  const userDetails = (user as any)?.data?.user_details;
  console.log("userDetails", userDetails);

  return (
    <div className="h-14 flex mt-3 rounded-lg bg-[#d6f5ff] shadow-md">
      <div className="flex justify-center items-center ml-2">
        <div className="border border-primary rounded-full  ">
          {userDetails?.profile_picture ? (
            <img
              src={userDetails.profile_picture}
              alt="profile"
              style={{ width: 35, height: 35, borderRadius: "50%" }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white font-medium">
              {userDetails?.full_name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium">{userDetails?.full_name}</div>
          <div className="text-xs text-gray-600">
            {userDetails?.email ?? userDetails?.user_id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomUserDetails;
