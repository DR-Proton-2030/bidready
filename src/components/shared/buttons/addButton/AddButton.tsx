"use client";
import React, { ReactNode, useEffect, useState } from "react";
import PrimaryButton from "../primaryButton/PrimaryButton";
import IconButton from "../iconButton/IconButton";
import {
  ArrowDownCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import SecondaryButton from "../secondaryButton/SecondaryButton";
import { useRouter } from "next/navigation";

const AddButton = ({
  text,
  route,
  icon,
  data,
  downloadType = "users",
}: {
  text: string;
  route: string;
  icon: ReactNode;
  data?: any;
  downloadType?: string;
}) => {
  const router = useRouter();
  const [isRefresh, setIsRefresh] = useState<boolean>(false);
  const handleAdd = () => {
    router.push(route);
  };

  const handleRefresh = () => {
    console.log("Refreshing data...");
    setIsRefresh(true);
    // router.refresh();
    window.location.reload();
  };
  const fileNameArray = text.split(" ");

  return (
    <div className="w-full flex justify-end mb-3 gap-4">
      <IconButton
        icon={
          <ArrowPathIcon
            className={`w-5 h-5 transition-transform ${
              isRefresh ? "animate-spin" : ""
            }`}
          />
        }
        onClick={handleRefresh}
      />
      <SecondaryButton
        text={"Download"}
        className="px-3"
        icon={<ArrowDownCircleIcon className="w-5 h-5" />}
        data={data}
        downloadType={downloadType}
        fileName={
          fileNameArray[1].concat(fileNameArray[2] ?? "").toLowerCase() +
          ".xlsx"
        }
      />
      <PrimaryButton
        text={text}
        className="px-3"
        icon={icon}
        onClick={handleAdd}
        key={"add-doctor"}
      />
    </div>
  );
};

export default AddButton;
