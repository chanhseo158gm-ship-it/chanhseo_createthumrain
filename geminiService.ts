
import { GoogleGenAI } from "@google/genai";

export const generateRainyScene = async (base64Image: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Based on this reference image of a house in the rain, generate a high-quality, ultra-wide landscape version (16:9 aspect ratio). 
  Keep the architectural style of the house and the overall environment similar, but expand the scene to show more of the surrounding forest or landscape. 
  Add spectacular and dramatic cinematic lightning bolts in the stormy dark sky to make it visually striking. 
  The atmosphere should be cozy yet powerful, with deep moody blues and greys. 
  Style: Hyper-realistic, 4k resolution, perfect for a Lo-fi YouTube background for 'Rain Sounds for Sleep'.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1],
          },
        },
        { text: prompt },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Không nhận được dữ liệu hình ảnh từ AI.");
};
