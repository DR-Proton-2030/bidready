import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProjectDetails } from "@/components/pages/projectDetails";
import { ProjectDetailsSkeleton } from "@/components/shared";
import { api } from "@/utils/api";
import { cookies } from "next/headers";

interface ProjectDetailsPageProps {
  params: Promise<{
    "project-id": string;
  }>;
}

async function getProjectDetails(projectId: string) {
  try {
    // Get token from cookies in server component
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      console.warn("No authentication token found in cookies");
      return null;
    }

    const projectDetails = await api.project.getProjectDetails(
      projectId,
      token
    );
    return projectDetails;
  } catch (error) {
    console.error("Error fetching project details:", error);
    return null;
  }
}

const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = async ({
  params,
}) => {
  const resolvedParams = await params;
  const projectId = resolvedParams["project-id"];

  if (!projectId) {
    notFound();
  }

  const projectDetails = await getProjectDetails(projectId);

  if (!projectDetails) {
    notFound();
  }

  console.log("==>projectDetails", projectDetails);
  return (
    <Suspense fallback={<ProjectDetailsSkeleton />}>
      <ProjectDetails projectData={projectDetails} projectId={projectId} />
    </Suspense>
  );
};

export default ProjectDetailsPage;
