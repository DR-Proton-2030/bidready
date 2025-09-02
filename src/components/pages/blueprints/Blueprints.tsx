"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { IGetBlueprintsResponse } from "@/components/pages/blueprints/BlueprintApi";
import { PageHeader, CategoryFilter, BlueprintCard } from "@/components/shared";
import { useBlueprints } from "@/hooks/useBlueprints/useBlueprints";
import {
  BLUEPRINT_CATEGORIES,
  BLUEPRINTS_TEXT,
} from "@/constants/blueprints/blueprints.constant";

type Props = {
  initialData?: IGetBlueprintsResponse;
};

const Blueprints: React.FC<Props> = ({ initialData }) => {
  const router = useRouter();

  const {
    activeCategory,
    filteredBlueprints,
    handleCategoryChange,
    handleDownload,
  } = useBlueprints({ initialData: initialData?.data });

  return (
    <div className="space-y-6">
      <PageHeader
        title={BLUEPRINTS_TEXT.pageTitle}
        buttonText={BLUEPRINTS_TEXT.newBlueprintButton}
        onButtonClick={() => router.push("/create-blueprint")}
      />

      <CategoryFilter
        categories={BLUEPRINT_CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlueprints.map((blueprint) => (
          <BlueprintCard
            key={blueprint.id}
            {...blueprint}
            onDownload={handleDownload}
          />
        ))}
      </div>
    </div>
  );
};

export default Blueprints;
