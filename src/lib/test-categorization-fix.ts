import { fetchAllCategoriesForDestination } from '../database/googlePlaces';

async function testCategorizationFix() {
  console.log('🧪 Testing categorization fix for Manali...');
  const testDestination = 'Manali';
  const testApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string;

  if (!testApiKey) {
    console.error('❌ API Key is not set for categorization test.');
    return;
  }

  try {
    const result = await fetchAllCategoriesForDestination(testDestination, testApiKey, 3);
    console.log('✅ Categorization test results for Manali:', result);

    // Check for camps in food_cafes (should not happen)
    const foodCafes = result.food_cafes || [];
    const campsInFood = foodCafes.filter(place => 
      place.types?.includes('campground') || 
      place.name.toLowerCase().includes('camp') ||
      place.name.toLowerCase().includes('temple') ||
      place.name.toLowerCase().includes('monument')
    );
    
    if (campsInFood.length === 0) {
      console.log('✅ No camps/temples/monuments found in Food & Cafes category.');
    } else {
      console.error('❌ Non-food places found in Food & Cafes category:', campsInFood.map(p => p.name));
    }

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
    
    if (nonFoodInFood.length === 0) {
      console.log('✅ Food & Cafes category contains only food establishments.');
    } else {
      console.error('❌ Non-food places found in Food & Cafes category:', nonFoodInFood.map(p => p.name));
    }

    // Check if all places have photos and high ratings
    const allPlaces = [...(result.attractions || []), ...(result.day_trips || []), ...(result.food_cafes || []), ...(result.hidden_gems || [])];
    const placesWithoutPhotosOrLowRating = allPlaces.filter(place => 
      !place.photoUrl || (place.rating && place.rating < 4.0) || (place.userRatingsTotal && place.userRatingsTotal < 10)
    );
    
    if (placesWithoutPhotosOrLowRating.length === 0) {
      console.log('✅ All fetched places have photos and high ratings (4.0+ and 10+ reviews).');
    } else {
      console.error('❌ Places found without photos or with low ratings:', placesWithoutPhotosOrLowRating.map(p => `${p.name} (Rating: ${p.rating}, Reviews: ${p.userRatingsTotal}, Photo: ${!!p.photoUrl})`));
    }

    console.log('✅ Categorization fix test complete.');

  } catch (error) {
    console.error('❌ Categorization fix test failed:', error);
  }
}

testCategorizationFix();


