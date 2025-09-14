// Test file to verify Gemini API configuration
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || ''
});

async function testGemini() {
  try {
    console.log('Testing Gemini API configuration...');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Can you respond with 'API is working'?"
    });
    
    console.log('✅ Gemini API Response:', response.text);
    console.log('✅ Configuration is working correctly!');
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    
    if (error.message?.includes('API_KEY') || error.message?.includes('apiKey')) {
      console.error('🔑 Please check your VITE_GEMINI_API_KEY in .env file');
    } else if (error.message?.includes('quota')) {
      console.error('📊 API quota exceeded');
    } else {
      console.error('🔧 Other error:', error);
    }
  }
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testGemini();
}

export { testGemini };
