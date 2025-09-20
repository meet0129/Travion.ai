/*
  Test file to verify the new Google Places API integration
  This file can be imported and used to test the functionality
*/

import { fetchAllCategoriesForDestination, geocodeDestination } from '../database/googlePlaces';

export async function testPlacesIntegration(apiKey: string, destination: string = 'Mumbai, India') {
  console.log('🧪 Testing Google Places API Integration...');
  
  try {
    // Test 1: Geocoding
    console.log('📍 Testing geocoding...');
    const location = await geocodeDestination(destination, apiKey);
    if (location) {
      console.log('✅ Geocoding successful:', location);
    } else {
      console.log('❌ Geocoding failed');
      return false;
    }

    // Test 2: Category-based search
    console.log('🔍 Testing category-based search...');
    const categories = await fetchAllCategoriesForDestination(destination, apiKey, 3);
    
    const categoryResults = {
      attractions: categories.attractions.length,
      day_trips: categories.day_trips.length,
      food_cafes: categories.food_cafes.length,
      hidden_gems: categories.hidden_gems.length
    };
    
    console.log('📊 Category results:', categoryResults);
    
    // Check if we got results for at least one category
    const totalResults = Object.values(categoryResults).reduce((sum, count) => sum + count, 0);
    if (totalResults > 0) {
      console.log('✅ Category search successful');
    } else {
      console.log('❌ No results found for any category');
      return false;
    }

    // Test 3: Enhanced data fields
    console.log('🔍 Testing enhanced data fields...');
    const samplePlace = categories.attractions[0] || categories.day_trips[0] || categories.food_cafes[0] || categories.hidden_gems[0];
    
    if (samplePlace) {
      const enhancedFields = {
        hasWebsite: !!samplePlace.website,
        hasPhone: !!samplePlace.phoneNumber,
        hasReviews: !!samplePlace.reviews && samplePlace.reviews.length > 0,
        hasOpeningHours: !!samplePlace.openingHours,
        hasEditorialSummary: !!samplePlace.editorialSummary,
        hasPhotos: !!samplePlace.photos && samplePlace.photos.length > 0
      };
      
      console.log('📋 Enhanced fields available:', enhancedFields);
      console.log('✅ Enhanced data fields test completed');
    }

    console.log('🎉 All tests passed! Integration is working correctly.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export for use in browser console or other testing scenarios
export default testPlacesIntegration;
