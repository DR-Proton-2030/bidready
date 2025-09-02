import React from "react";
import { PageHeader, BlueprintCard } from "@/components/shared";
import { BluePrint } from "@/@types/interface/blueprint.interface";
import { BLUEPRINTS_TEXT } from "@/constants/blueprints/blueprints.constant";

const Blueprints: React.FC<{ data?: BluePrint[] }> = ({ data }) => {

  return (
    <div className="space-y-6">
      <PageHeader
        title={BLUEPRINTS_TEXT.pageTitle}
        buttonText={BLUEPRINTS_TEXT.newBlueprintButton}
        link="/create-blueprint"
      />

      {/* <CategoryFilter
        categories={BLUEPRINT_CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      /> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((blueprint) => (
          <BlueprintCard
            key={blueprint._id}
            {...blueprint}
          />
        ))}
      </div>
    </div>
  );
};

export default Blueprints;
