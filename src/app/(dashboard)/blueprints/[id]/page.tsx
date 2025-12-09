import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import BlueprintDetails from "@/components/pages/bluePrintDeatils/BlurPrintDetails";
import { api } from "@/utils/api";
import { cookies } from "next/headers";
import Loader from "@/components/shared/loader/Loader";

interface BlueprintDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getBlueprintDetails(blueprintId: string, versionId?: string) {
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
      token,
      versionId
    );
    return blueprintDetails;
  } catch (error) {
    console.error("Error fetching blueprint details:", error);
    return null;
  }
}

const BlueprintDetailsPage: React.FC<BlueprintDetailsPageProps> = async ({
  params,
  searchParams,
}) => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const blueprintId = resolvedParams.id;
  const versionId = typeof resolvedSearchParams.versionId === 'string' ? resolvedSearchParams.versionId : undefined;

  if (!blueprintId) {
    notFound();
  }

  const blueprintDetails = await getBlueprintDetails(blueprintId, versionId);
  console.log("======>blueprintDetails", blueprintDetails);
  if (!blueprintDetails) {
    notFound();
  }

  console.log("==>blueprintDetails", blueprintDetails);
  return (
    <Suspense fallback={<Loader />}>
      <BlueprintDetails blueprintDetails={blueprintDetails} versionId={versionId} />
    </Suspense>
  );
};

export default BlueprintDetailsPage;
