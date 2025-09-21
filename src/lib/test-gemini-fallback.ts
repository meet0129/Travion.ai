// Test Gemini fallback responses
import { geminiService } from './gemini';

export async function testGeminiFallback() {
  try {
    // Initialize the service
    await geminiService.initialize();
    
    // Test with no context
    const response1 = await geminiService.sendMessage("I want to visit Goa");
    
    // Test with partial context
    const tripContext = {
      destination: 'Goa',
      startLocation: '',
      startDate: '',
      endDate: '',
      duration: '',
      travelers: 0
    };
    
    const response2 = await geminiService.sendMessage("I'm from Mumbai", tripContext);
    
    // Test with complete context
    const completeContext = {
      destination: 'Goa',
      startLocation: 'Mumbai',
      startDate: 'December 15th',
      endDate: 'December 20th',
      duration: '5 days',
      travelers: 2
    };
    
    const response3 = await geminiService.sendMessage("Perfect!", completeContext);
    
    return true;
  } catch (error) {
    return false;
  }
}

// Auto-run test when imported (silent)
if (typeof window !== 'undefined') {
  testGeminiFallback();
}
