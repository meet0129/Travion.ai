// Test categorization accuracy
import { fetchAllCategoriesForDestination } from '../database/googlePlaces';

export async function testCategorization() {
  const testDestination = 'Manali';
  const testApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string;

  if (!testApiKey) {
    return;
  }

  try {
    const result = await fetchAllCategoriesForDestination(testDestination, testApiKey, 3);
    
    // Check for categorization issues
    const issues = [];
    
    // Check if camps are in food category
    const campsInFood = result.food_cafes.filter(place => 
      place.types?.includes('campground') || 
      place.name.toLowerCase().includes('camp') ||
      place.name.toLowerCase().includes('backpacker')
    );
    
    if (campsInFood.length > 0) {
      issues.push(`Found ${campsInFood.length} camps in food category`);
    }
    
    // Check if restaurants are in attractions
    const restaurantsInAttractions = result.attractions.filter(place => 
      place.types?.includes('restaurant') || 
      place.types?.includes('cafe') ||
      place.name.toLowerCase().includes('restaurant') ||
      place.name.toLowerCase().includes('cafe')
    );
    
    if (restaurantsInAttractions.length > 0) {
      issues.push(`Found ${restaurantsInAttractions.length} restaurants in attractions`);
    }
    
    // Check if hotels are in attractions
    const hotelsInAttractions = result.attractions.filter(place => 
      place.types?.includes('lodging') || 
      place.name.toLowerCase().includes('hotel') ||
      place.name.toLowerCase().includes('resort')
    );
    
    if (hotelsInAttractions.length > 0) {
      issues.push(`Found ${hotelsInAttractions.length} hotels in attractions`);
    }
    
    return result;
  } catch (error) {
    return null;
  }
}

// Auto-run test when imported (silent)
if (typeof window !== 'undefined') {
  testCategorization();
}
