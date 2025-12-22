
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types/gemini";

export const analyzeFloorPlan = async (base64Image: string): Promise<AIAnalysisResult> => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY. Please add it to your .env file.");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    URGENT: PERFORM DEEP SPATIAL ANALYSIS.
    The goal is to calculate a pixel-to-real-world scale factor with near-perfect accuracy.
    
    STEP 1: SCAN ALL DIMENSION STRINGS. 
    Find at least 5 dimension labels on the drawing (e.g., "25'-0\"", "12'-6\"", etc.).
    
    STEP 2: SELECT BEST CALIBRATION ANCHOR.
    Choose the longest, clearest horizontal or vertical dimension line. 
    Avoid diagonal lines or small interior dimensions if large exterior ones are available.
    
    STEP 3: PRECISE COORDINATES.
    Locate the EXACT pixel centers for the start and end ticks of the chosen dimension.
    Return these as normalized [y, x] coordinates (0-1000).
    
    STEP 4: PARSE VALUE.
    Convert strings like "25'-0\"" into a decimal number (25.0). 
    Return the unit as 'ft' or 'm'.
    
    STEP 5: CROSS-VERIFY.
    Check your chosen scale against one other dimension. If they conflict, re-analyze.
    
    OUTPUT: Provide a JSON object matching the requested schema. Ensure 'labelUsed' contains the raw string you calibrated from.
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Use a stable model
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image.split(',')[1],
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scaleText: { type: Type.STRING },
            detectedUnits: { type: Type.STRING, enum: ['imperial', 'metric'] },
            confidence: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
            allExtractedText: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, enum: ['room', 'dimension', 'label', 'scale'] },
                  text: { type: Type.STRING }
                },
                required: ['category', 'text']
              }
            },
            autoCalibration: {
              type: Type.OBJECT,
              properties: {
                startNormalized: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                endNormalized: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                realValue: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                labelUsed: { type: Type.STRING }
              },
              required: ['startNormalized', 'endNormalized', 'realValue', 'unit', 'labelUsed']
            }
          },
          required: ['scaleText', 'detectedUnits', 'confidence', 'explanation', 'allExtractedText']
        }
      },
    });

    const text = result.text;
    if (!text) throw new Error("No text response from Gemini.");
    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error((error as Error).message || "Failed deep AI scan. Please try a clearer image or check your API limit.");
  }
};
