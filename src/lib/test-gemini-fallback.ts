// Test Gemini fallback responses
import { geminiService } from './gemini';

export async function testGeminiFallback() {
  console.log('🧪 Testing Gemini Fallback Responses...');
  
  try {
    // Initialize the service
    await geminiService.initialize();
    
    // Test with no context
    const response1 = await geminiService.sendMessage("I want to visit Goa");
    console.log('✅ Test 1 - No context:', response1);
    
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
    console.log('✅ Test 2 - Partial context:', response2);
    
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
    console.log('✅ Test 3 - Complete context:', response3);
    
    console.log('✅ All fallback tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Fallback test failed:', error);
    return false;
  }
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  testGeminiFallback();
}
