// Test API call to verify the setup works
export async function testApiCall() {
  // Check environment variables
  const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  const placesApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  
  if (!functionsUrl) {
    return false;
  }
  
  if (!placesApiKey) {
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
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return true;
    
  } catch (error) {
    return false;
  }
}

// Auto-run test when imported (silent)
if (typeof window !== 'undefined') {
  testApiCall();
}
