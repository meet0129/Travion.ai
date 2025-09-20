// Verify the complete setup is working
import { fetchAllCategoriesForDestination } from '../database/googlePlaces';

export async function verifyCompleteSetup() {
  console.log('🔍 Verifying complete setup...');
  
  // Check environment variables
  const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  const placesApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  
  console.log('Environment variables:', {
    functionsUrl: functionsUrl,
    placesApiKey: placesApiKey ? 'SET' : 'NOT SET'
  });
  
  if (!functionsUrl || !placesApiKey) {
    console.error('❌ Missing environment variables');
    return false;
  }
  
  try {
    console.log('🚀 Testing complete API flow...');
    const result = await fetchAllCategoriesForDestination('Mumbai, India', placesApiKey, 2);
    
    console.log('✅ Complete setup verification successful:', result);
    
    // Check if we got results
    const totalResults = Object.values(result).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`📊 Total places found: ${totalResults}`);
    
    return totalResults > 0;
  } catch (error) {
    console.error('❌ Complete setup verification failed:', error);
    return false;
  }
}

// Auto-run verification
if (typeof window !== 'undefined') {
  verifyCompleteSetup();
}
