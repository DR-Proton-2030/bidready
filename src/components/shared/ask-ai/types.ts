export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type DetectionPreview = {
  totalPredictions: number;
  totalUserAnnotations: number;
  totalMeasurements: number;
  calibration: Record<string, any> | null;
  classBreakdown: Array<[string, number]>;
};
