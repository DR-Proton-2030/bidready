/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { getBlueprintDetails } from "../../../utils/api/blueprint/blueprint.api";
import BlueprintDetailsClient from "./BlueprintDetailsClient";

interface Props {
  blueprintDetails?: any;
  versionId?: string;
}

const BlueprintDetails = async ({ blueprintDetails, versionId }: Props) => {
  const id = blueprintDetails?.blueprint?._id;

  try {
    const data = await getBlueprintDetails(id, undefined, versionId);
    // server-side log
    // eslint-disable-next-line no-console
    console.log("SSR: fetched blueprint details:", data);
    return <BlueprintDetailsClient blueprintDetails={data} />;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("SSR: failed to fetch blueprint details", err);
    return <BlueprintDetailsClient blueprintDetails={blueprintDetails ?? null} />;
  }
};

export default BlueprintDetails;
