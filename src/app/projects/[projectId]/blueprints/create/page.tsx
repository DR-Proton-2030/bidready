import React from "react";
import CreateBlueprintPage from "@/app/(dashboard)/create-blueprint/page";
import MainLayout from "@/components/layouts/MainLayout";

interface Props {
  params: { projectId: string };
}

export default function ProjectCreateBlueprintPage({ params }: Props) {
  const { projectId } = params;
  return (
    <MainLayout>
      <CreateBlueprintPage initialProjectId={projectId} />
    </MainLayout>
  );
}
