// Debug environment variables
export function debugEnvironment() {
  // Check if we have the required URLs
  const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  const placesApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  
  return {
    functionsUrl: !!functionsUrl,
    placesApiKey: !!placesApiKey
  };
}
