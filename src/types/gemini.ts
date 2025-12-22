
export interface ExtractedTextItem {
  category: 'room' | 'dimension' | 'label' | 'scale';
  text: string;
}

export interface AutoCalibrationLine {
  startNormalized: [number, number]; // [y, x] 0-1000
  endNormalized: [number, number];   // [y, x] 0-1000
  realValue: number;
  unit: string;
  labelUsed: string; // The literal text read from the drawing (e.g. "25'-0\"")
}

export interface AIAnalysisResult {
  scaleText: string;
  detectedUnits: 'imperial' | 'metric';
  confidence: number;
  explanation: string;
  allExtractedText: ExtractedTextItem[];
  autoCalibration?: AutoCalibrationLine;
}
