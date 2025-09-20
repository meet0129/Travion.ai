// Test categorization accuracy
import { fetchAllCategoriesForDestination } from '../database/googlePlaces';

export async function testCategorization() {
  console.log('🧪 Testing Categorization Accuracy...');
  
  const testDestination = 'Manali';
  const testApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string;

  if (!testApiKey) {
    console.error('❌ API Key is not set for categorization test.');
    return;
  }

  try {
    const result = await fetchAllCategoriesForDestination(testDestination, testApiKey, 3);
    
    console.log('📊 Categorization Test Results:');
    
    // Test Attractions
    console.log('🏛️ Attractions:', result.attractions.length);
    result.attractions.forEach((place, index) => {
      console.log(`  ${index + 1}. ${place.name} - Types: ${place.types?.join(', ')}`);
    });
    
    // Test Day Trips
    console.log('🏔️ Day Trips:', result.day_trips.length);
    result.day_trips.forEach((place, index) => {
      console.log(`  ${index + 1}. ${place.name} - Types: ${place.types?.join(', ')}`);
    });
    
    // Test Food & Cafes
    console.log('🍽️ Food & Cafes:', result.food_cafes.length);
    result.food_cafes.forEach((place, index) => {
      console.log(`  ${index + 1}. ${place.name} - Types: ${place.types?.join(', ')}`);
    });
    
    // Test Hidden Gems
    console.log('💎 Hidden Gems:', result.hidden_gems.length);
    result.hidden_gems.forEach((place, index) => {
      console.log(`  ${index + 1}. ${place.name} - Types: ${place.types?.join(', ')}`);
    });
    
    // Check for categorization issues
    const issues = [];
    
    // Check if camps are in food category
    const campsInFood = result.food_cafes.filter(place => 
      place.types?.includes('campground') || 
      place.name.toLowerCase().includes('camp') ||
      place.name.toLowerCase().includes('backpacker')
    );
    
    if (campsInFood.length > 0) {
      issues.push(`❌ Found ${campsInFood.length} camps in food category: ${campsInFood.map(p => p.name).join(', ')}`);
    }
    
    // Check if restaurants are in attractions
    const restaurantsInAttractions = result.attractions.filter(place => 
      place.types?.includes('restaurant') || 
      place.types?.includes('cafe') ||
      place.name.toLowerCase().includes('restaurant') ||
      place.name.toLowerCase().includes('cafe')
    );
    
    if (restaurantsInAttractions.length > 0) {
      issues.push(`❌ Found ${restaurantsInAttractions.length} restaurants in attractions: ${restaurantsInAttractions.map(p => p.name).join(', ')}`);
    }
    
    // Check if hotels are in attractions
    const hotelsInAttractions = result.attractions.filter(place => 
      place.types?.includes('lodging') || 
      place.name.toLowerCase().includes('hotel') ||
      place.name.toLowerCase().includes('resort')
    );
    
    if (hotelsInAttractions.length > 0) {
      issues.push(`❌ Found ${hotelsInAttractions.length} hotels in attractions: ${hotelsInAttractions.map(p => p.name).join(', ')}`);
    }
    
    if (issues.length === 0) {
      console.log('✅ Categorization test passed! No cross-category contamination found.');
    } else {
      console.log('❌ Categorization issues found:');
      issues.forEach(issue => console.log(issue));
    }
    
    return result;
  } catch (error) {
    console.error('❌ Categorization test failed:', error);
    return null;
  }
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  testCategorization();
}
