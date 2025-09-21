// Test file to verify Gemini API configuration
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || ''
});

async function testGemini() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Can you respond with 'API is working'?"
    });
    
    return true;
    
  } catch (error) {
    return false;
  }
}

// Run test if this file is executed directly (silent)
if (typeof window === 'undefined') {
  testGemini();
}

export { testGemini };
