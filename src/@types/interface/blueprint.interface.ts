export interface Blueprint {
  id: number;
  name: string;
  description: string;
  category: string;
  lastModified: string;
  version: string;
}

export interface BlueprintCategory {
  name: string;
  value: string;
}
