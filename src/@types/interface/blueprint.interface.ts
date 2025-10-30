export interface BluePrint {
  _id?: string;
  name: string;
  description: string;
  version: string;
  status: string;
  type: string;
  svg_overlay_url: string;
  project_object_id: string;
  created_by_object_id: string;
  last_modified_by_object_id: string;
  company_object_id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BlueprintCategory {
  name: string;
  value: string;
}

export interface ProcessedImage {
  id: string;
  name: string;
  path: string;
  pageNumber?: number;
  svgOverlay?: string | null;
}

export interface BlueprintFormData {
  name: string;
  description: string;
  version: string;
  status: string;
  type: string;
  project_object_id: string;
}
