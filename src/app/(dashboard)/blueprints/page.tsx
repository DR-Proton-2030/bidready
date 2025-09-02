import Blueprints from "@/components/pages/blueprints/Blueprints";
import React from "react";
import { getBlueprintData } from "@/components/pages/blueprints/BlueprintApi";

const BlueprintsPage = async () => {
  const data = await getBlueprintData(1);
  return <Blueprints initialData={data} />;
};

export default BlueprintsPage;
