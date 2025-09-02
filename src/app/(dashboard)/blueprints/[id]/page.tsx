/* eslint-disable @typescript-eslint/no-explicit-any */
import BlueprintDetails from "@/components/pages/bluePrintDeatils/BlurPrintDetails";
import React from "react";

interface BlueprintDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<any>;
}

const BlueprintDetailsPage = async ({ params }: BlueprintDetailsPageProps) => {
  const resolvedParams = await params;
  const blueprintId = resolvedParams.id;

  return (
    <div id="">
      <BlueprintDetails />
    </div>
  );
};

export default BlueprintDetailsPage;
