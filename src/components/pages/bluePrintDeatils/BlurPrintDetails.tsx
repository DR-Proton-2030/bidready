/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import BlueprintDetailsClient from "./BlueprintDetailsClient";

interface Props {
  blueprintDetails?: any;
  versionId?: string;
}

const BlueprintDetails = async ({ blueprintDetails, versionId }: Props) => {
  return <BlueprintDetailsClient blueprintDetails={blueprintDetails ?? null} />;
};

export default BlueprintDetails;
