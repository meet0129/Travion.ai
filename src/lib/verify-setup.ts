// Verify the complete setup is working
import { fetchAllCategoriesForDestination } from '../database/googlePlaces';

export async function verifyCompleteSetup() {
  // Check environment variables
  const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  const placesApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  
  if (!functionsUrl || !placesApiKey) {
    return false;
  }
  
  try {
    const result = await fetchAllCategoriesForDestination('Mumbai, India', placesApiKey, 2);
    
    // Check if we got results
    const totalResults = Object.values(result).reduce((sum, arr) => sum + arr.length, 0);
    
    return totalResults > 0;
  } catch (error) {
    return false;
  }
}

// Auto-run verification (silent)
if (typeof window !== 'undefined') {
  verifyCompleteSetup();
}
