/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { getBlueprintDetails } from "../../../utils/api/blueprint/blueprint.api";
import BlueprintDetailsClient from "./BlueprintDetailsClient";

interface Props {
  blueprintDetails?: any;
}

const BlueprintDetails = async ({ blueprintDetails }: Props) => {
  const id = blueprintDetails?.blueprint?._id ?? "68f93ac666d6b7928e00052d";

  try {
    const data = await getBlueprintDetails(id);
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
