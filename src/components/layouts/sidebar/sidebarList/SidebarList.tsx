"use client";
import Link from "next/link";
import React, { useContext } from "react";
import { usePathname } from "next/navigation";
import AuthContext from "@/contexts/authContext/authContext";
import { ISidebarItem } from "@/@types/interface/sidebarItem.interface";

const SidebarList = ({ sidebarItems }: { sidebarItems: ISidebarItem[] }) => {
  const pathname = usePathname();
  const { user } = useContext(AuthContext);

  return (
    <div className="z-10 flex flex-col justify-between">
      <ul className="space-y-2 font-medium opacity-75">
        {sidebarItems.map((item: ISidebarItem) => (
          <li key={item.id} className="mb-2">
              <Link
                href={item.route ?? "#"}
                className={`flex items-center ${
                  pathname.slice(7).includes(item.id)
                    ? "bg-light-primary text-white"
                    : "text-gray-950 bg-gray-50 hover:bg-gray-200 hover:opacity-100"
                } p-2 rounded-md`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
          </li>
        ))}
      </ul>
      {/* <div className="flex ml-2 justify-center items-center mt-14 ">
        <UserProfile />
      </div> */}
    </div>
  );
};

export default SidebarList;
