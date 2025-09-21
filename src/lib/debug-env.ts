// Debug environment variables
export function debugEnvironment() {
  console.log('🔍 Environment Variables Debug:');
  console.log('VITE_FIREBASE_FUNCTIONS_URL:', import.meta.env.VITE_FIREBASE_FUNCTIONS_URL);
  console.log('VITE_GOOGLE_PLACES_API_KEY:', import.meta.env.VITE_GOOGLE_PLACES_API_KEY ? 'SET' : 'NOT SET');
  console.log('VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT SET');
  
  // Check if we have the required URLs
  const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  const placesApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  
  if (!functionsUrl) {
    console.error('❌ VITE_FIREBASE_FUNCTIONS_URL is not set');
  } else {
    console.log('✅ VITE_FIREBASE_FUNCTIONS_URL is set:', functionsUrl);
  }
  
  if (!placesApiKey) {
    console.error('❌ VITE_GOOGLE_PLACES_API_KEY is not set');
  } else {
    console.log('✅ VITE_GOOGLE_PLACES_API_KEY is set');
  }
  
  return {
    functionsUrl: !!functionsUrl,
    placesApiKey: !!placesApiKey
  };
}
