import React, { ReactNode } from "react";

const IconButton = ({
  icon,
  onClick,
}: {
  icon: ReactNode;
  onClick?: () => void;
}) => {
  return (
    <button className="icon-button" onClick={onClick}>
      {icon}
    </button>
  );
};

export default IconButton;
