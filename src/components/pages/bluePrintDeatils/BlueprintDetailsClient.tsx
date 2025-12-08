"use client";

import React, { useState } from "react";
import TopBar from "./TopBar";
import RightPanel from "./RightPanel";
import Dasboard from "./Dasboard";

interface BlueprintDetailsClientProps {
  blueprintDetails: any;
}

const BlueprintDetailsClient: React.FC<BlueprintDetailsClientProps> = ({ blueprintDetails }) => {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  console.log("=====>festxhed details of blue print ", blueprintDetails)
  return (
    <div className="overflow-block">
      <Dasboard blueprintDetails={blueprintDetails} />
      {/* <RightPanel isOpen={isRightPanelOpen} images={blueprintDetails?.images ?? []} /> */}
    </div>
  );
};

export default BlueprintDetailsClient;
