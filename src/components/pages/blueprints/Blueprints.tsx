import React from "react";
import { PageHeader, BlueprintCard } from "@/components/shared";
import { BluePrint } from "@/@types/interface/blueprint.interface";
import { BLUEPRINTS_TEXT } from "@/constants/blueprints/blueprints.constant";

const Blueprints: React.FC<{ data?: BluePrint[] }> = ({ data }) => {
  console.log("===blueprints data", data);
  return (
    <div className="space-y-6 px-16 pt-10 bg-gradient-to-br from-slate-100 to-slate-200 min-h-[calc(100vh-64px)]">
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
        {
          data?.length === 0 && (
            <p className="text-center text-gray-500 col-span-full">
              <img src="https://img.icons8.com/?size=160&id=78339&format=png" alt="" className="mx-auto" />
              Sorry ! No blueprints available.
            </p>
          )
        }
        {data?.map((blueprint) => (
          <BlueprintCard key={blueprint._id} {...blueprint} />
        ))}
      </div>
    </div>
  );
};

export default Blueprints;
