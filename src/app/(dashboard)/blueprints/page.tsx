import Blueprints from "@/components/pages/blueprints/Blueprints";
import React from "react";
import { getBlueprintData } from "@/components/pages/blueprints/BlueprintApi";

const BlueprintsPage = async ({
  searchParams,
}: {
  searchParams?: Promise<any>;
}) => {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const page = resolvedSearchParams.page
    ? parseInt(resolvedSearchParams.page, 10)
    : 1;
  const { data, pagination, total } = await getBlueprintData(page);
  return (
    <div id="project-page">
      <Blueprints data={data} />
    </div>
  );
};

export default BlueprintsPage;
