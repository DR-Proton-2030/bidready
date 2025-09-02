/* eslint-disable @typescript-eslint/no-explicit-any */

import { getProjectData } from "@/components/pages/projects/ProjectApi";
import Projects from "@/components/pages/projects/Projects";
import React from "react";

const ProjectListPage = async ({
  searchParams,
}: {
  searchParams?: Promise<any>;
}) => {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const page = resolvedSearchParams.page
    ? parseInt(resolvedSearchParams.page, 10)
    : 1;
  const data = await getProjectData(page);
  return (
    <div id="project-page p">
      <Projects {...data} />
    </div>
  );
};

export default ProjectListPage;
