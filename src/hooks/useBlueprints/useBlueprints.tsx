'use client';

import { useState, useMemo } from 'react';
import { Blueprint } from '@/@types/interface/blueprint.interface';
import { BLUEPRINTS_DATA, BLUEPRINTS_TEXT } from '@/constants/blueprints/blueprints.constant';

export const useBlueprints = () => {
  const [activeCategory, setActiveCategory] = useState<string>(BLUEPRINTS_TEXT.allCategory);

  const filteredBlueprints = useMemo(() => {
    return activeCategory === BLUEPRINTS_TEXT.allCategory 
      ? BLUEPRINTS_DATA 
      : BLUEPRINTS_DATA.filter(blueprint => blueprint.category === activeCategory);
  }, [activeCategory]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleDownload = (id: number) => {
    // This could be enhanced to actually handle download logic
    console.log(`Downloading blueprint with id: ${id}`);
    // You can add actual download logic here
  };

  const handleNewBlueprint = () => {
    // This could open a modal or navigate to a new page
    console.log('Creating new blueprint...');
    // You can add actual creation logic here
  };

  return {
    activeCategory,
    filteredBlueprints,
    handleCategoryChange,
    handleDownload,
    handleNewBlueprint,
  };
};
