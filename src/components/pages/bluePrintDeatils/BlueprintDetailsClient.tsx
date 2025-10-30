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
console.log("=====>festxhed details of blue print ",blueprintDetails)
  return (
    <div className="flex  bg-white font-sans  overflow-y-auto ">
      <main className="flex-1 flex flex-col">
        <TopBar onToggleRightPanel={() => setIsRightPanelOpen((s) => !s)} blueprintDetails={blueprintDetails} />
        <div className="overflow-hidden bg-white px-6 ">
          <Dasboard blueprintDetails={blueprintDetails} />
        </div>
      </main>
      <RightPanel isOpen={isRightPanelOpen} images={blueprintDetails?.images ?? []} />
    </div>
  );
};

export default BlueprintDetailsClient;
