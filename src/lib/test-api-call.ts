// Test API call to verify the setup works
export async function testApiCall() {
  console.log('🧪 Testing API call...');
  
  // Check environment variables
  const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  const placesApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  
  console.log('Environment check:', {
    functionsUrl: !!functionsUrl,
    placesApiKey: !!placesApiKey,
    functionsUrlValue: functionsUrl
  });
  
  if (!functionsUrl) {
    console.error('❌ VITE_FIREBASE_FUNCTIONS_URL is not set');
    return false;
  }
  
  if (!placesApiKey) {
    console.error('❌ VITE_GOOGLE_PLACES_API_KEY is not set');
    return false;
  }
  
  try {
    // Test a simple API call
    const response = await fetch(`${functionsUrl}/places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'textsearch',
        query: 'Mumbai, India'
      })
    });
    
    console.log('📡 API Response status:', response.status);
    
    if (!response.ok) {
      const text = await response.text();
      console.error('❌ API call failed:', response.status, text);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ API call successful:', data);
    return true;
    
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  testApiCall();
}
