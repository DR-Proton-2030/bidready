import { ButtonProps } from "@/@types/interface/button.interface";
import React, { useContext } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import AuthContext from "@/contexts/authContext/authContext";
import { toast } from "react-toastify";

const SecondaryButton: React.FC<ButtonProps> = ({
  text,
  className,
  icon,
  data,
  downloadType,
  fileName = "download.xlsx",
}) => {
  const { user } = useContext(AuthContext);
  const userRole = (user as any)?.data?.user_details.role;
  const isSuperAdmin = (user as any)?.data.admin_role;

  console.log("UserDetails from Download button ==>", userRole);
  console.log("data for download==>", data);

  const handleDownload = () => {
    if (!data || !Array.isArray(data)) return;
    if (downloadType === "others" && userRole !== "admin") {
      toast.warning("Permission Denied!");
      return;
    }
    const openFieldsForUsers = ["pincode", "house_hold_name", "areaName"];
    const superAdminFieldsForUsers = [
      "primary_phone_number",
      "house_hold_address",
    ];

    const filteredData = data.map((row: Record<string, any>) => {
      const allowedFields =
        userRole === "admin" && isSuperAdmin
          ? superAdminFieldsForUsers
          : openFieldsForUsers;

      const filteredRow: Record<string, any> = {};
      allowedFields.forEach((key) => {
        if (key in row) filteredRow[key] = row[key];
      });
      return filteredRow;
    });
    const downloadData = downloadType !== "users" ? data : filteredData;

    const worksheet = XLSX.utils.json_to_sheet(downloadData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, fileName);
  };

  return (
    <div id="primary-button-container">
      <button
        id="secondary-button"
        className={`btn-secondary ${className}`}
        type="button"
        onClick={data && handleDownload}
      >
        {text}
        {icon}
      </button>
    </div>
  );
};

export default SecondaryButton;
