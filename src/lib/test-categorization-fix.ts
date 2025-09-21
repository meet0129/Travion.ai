import { fetchAllCategoriesForDestination } from '../database/googlePlaces';

async function testCategorizationFix() {
  const testDestination = 'Manali';
  const testApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string;

  if (!testApiKey) {
    return;
  }

  try {
    const result = await fetchAllCategoriesForDestination(testDestination, testApiKey, 3);

    // Check for camps in food_cafes (should not happen)
    const foodCafes = result.food_cafes || [];
    const campsInFood = foodCafes.filter(place => 
      place.types?.includes('campground') || 
      place.name.toLowerCase().includes('camp') ||
      place.name.toLowerCase().includes('temple') ||
      place.name.toLowerCase().includes('monument')
    );

    // Check if food_cafes only contains food establishments
    const nonFoodInFood = foodCafes.filter(place => {
      const placeTypes = place.types || [];
      const placeName = place.name.toLowerCase();
      
      const foodTypes = ['restaurant', 'cafe', 'bar', 'bakery', 'food', 'meal_takeaway', 'meal_delivery', 'night_club'];
      const foodKeywords = ['restaurant', 'cafe', 'dining', 'food', 'kitchen', 'bistro', 'eatery', 'grill', 'pizza', 'burger', 'diner', 'pub'];
      
      const hasFoodType = foodTypes.some(type => placeTypes.includes(type));
      const hasFoodKeyword = foodKeywords.some(keyword => placeName.includes(keyword));
      
      return !hasFoodType && !hasFoodKeyword;
    });

    // Check if all places have photos and high ratings
    const allPlaces = [...(result.attractions || []), ...(result.day_trips || []), ...(result.food_cafes || []), ...(result.hidden_gems || [])];
    const placesWithoutPhotosOrLowRating = allPlaces.filter(place => 
      !place.photoUrl || (place.rating && place.rating < 4.0) || (place.userRatingsTotal && place.userRatingsTotal < 10)
    );

  } catch (error) {
    // Silent error handling
  }
}

// Auto-run test when imported (silent)
if (typeof window !== 'undefined') {
  testCategorizationFix();
}


