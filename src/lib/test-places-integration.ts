/*
  Test file to verify the new Google Places API integration
  This file can be imported and used to test the functionality
*/

import { fetchAllCategoriesForDestination, geocodeDestination } from '../database/googlePlaces';

export async function testPlacesIntegration(apiKey: string, destination: string = 'Mumbai, India') {
  try {
    // Test 1: Geocoding
    const location = await geocodeDestination(destination, apiKey);
    if (!location) {
      return false;
    }

    // Test 2: Category-based search
    const categories = await fetchAllCategoriesForDestination(destination, apiKey, 3);
    
    const categoryResults = {
      attractions: categories.attractions.length,
      day_trips: categories.day_trips.length,
      food_cafes: categories.food_cafes.length,
      hidden_gems: categories.hidden_gems.length
    };
    
    // Check if we got results for at least one category
    const totalResults = Object.values(categoryResults).reduce((sum, count) => sum + count, 0);
    if (totalResults === 0) {
      return false;
    }

    // Test 3: Enhanced data fields
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
    }

    return true;
    
  } catch (error) {
    return false;
  }
}

// Export for use in browser console or other testing scenarios
export default testPlacesIntegration;
