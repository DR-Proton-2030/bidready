import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import BlueprintDetails from "@/components/pages/bluePrintDeatils/BlurPrintDetails";
import { api } from "@/utils/api";
import { cookies } from "next/headers";

interface BlueprintDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getBlueprintDetails(blueprintId: string) {
  try {
    // Get token from cookies in server component
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      console.warn("No authentication token found in cookies");
      return null;
    }

    const blueprintDetails = await api.blueprint.getBlueprintDetails(
      blueprintId,
      token
    );
    return blueprintDetails;
  } catch (error) {
    console.error("Error fetching blueprint details:", error);
    return null;
  }
}

const BlueprintDetailsPage: React.FC<BlueprintDetailsPageProps> = async ({
  params,
}) => {
  const resolvedParams = await params;
  const blueprintId = resolvedParams.id;

  if (!blueprintId) {
    notFound();
  }

  const blueprintDetails = await getBlueprintDetails(blueprintId);
  console.log("======>blueprintDetails", blueprintDetails);
  if (!blueprintDetails) {
    notFound();
  }

  console.log("==>blueprintDetails", blueprintDetails);
  return (
    <Suspense fallback={<div>Loading blueprint...</div>}>
      <BlueprintDetails blueprintDetails={blueprintDetails} />
    </Suspense>
  );
};

export default BlueprintDetailsPage;
