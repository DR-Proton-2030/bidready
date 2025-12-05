export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  // Optional quick actions suggested by the assistant. Buttons will be rendered below assistant messages.
  actions?: Array<{ id: string; label: string }>;
};

export type DetectionPreview = {
  totalPredictions: number;
  totalUserAnnotations: number;
  totalMeasurements: number;
  calibration: Record<string, any> | null;
  classBreakdown: Array<[string, number]>;
};
