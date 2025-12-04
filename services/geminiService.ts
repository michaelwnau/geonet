import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSurveillanceLog = async (cityName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a single, short, cryptic sci-fi cyberpunk terminal "surveillance log" entry for a target located in ${cityName}. 
      Use technical jargon, hex codes, or mock coordinates. 
      Keep it under 30 words. 
      Do not include quotes. 
      Examples: 
      "Detected energy spike in sector 7G. Infrared signature matching operative profile."
      "Intercepted encrypted packet. Source traced to local mesh network. Decrypting..."
      `,
      config: {
        maxOutputTokens: 60,
        temperature: 0.8,
      }
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini uplink failed:", error);
    return `CONNECTION ERROR: UNABLE TO RETRIEVE DATA FOR ${cityName}. RETRYING HANDSHAKE...`;
  }
};
