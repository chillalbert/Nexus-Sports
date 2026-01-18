
import { GoogleGenAI, Type } from "@google/genai";

export const safetyGuardian = async (message: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following chat message for Nexus Sports (a youth and adult sports app). 
      Identify if it contains PII (phone numbers, addresses, social handles), bullying, or predatory behavior.
      Message: "${message}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
            flaggedSegments: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["isSafe", "reason"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Guardian service error:", error);
    return { isSafe: true, reason: "Service unavailable" };
  }
};

export const findRealVenues = async (sport: string, lat: number, lng: number, radiusMiles: number) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find exactly 3 real public ${sport} courts or sports parks within ${radiusMiles} miles of latitude ${lat}, longitude ${lng}. Return their specific street addresses and names. Be precise about the distance.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const venues = chunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        name: chunk.maps.title,
        uri: chunk.maps.uri,
        address: chunk.maps.address || 'Public Location'
      }));

    return venues;
  } catch (error) {
    console.error("Google Maps Grounding Error:", error);
    return [];
  }
};

export const generateSportsAdvice = async (sport: string, skillLevel: number) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Give 3 pro tips for a level ${skillLevel} player in ${sport}. Keep it punchy and athletic.`,
    });
    return response.text;
  } catch (error) {
    console.error("Advice generation error:", error);
    return "Stay focused on basics and keep grinding.";
  }
};
