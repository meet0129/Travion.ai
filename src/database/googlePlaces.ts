/*
  Google Places lightweight data service
  - Uses Text Search for destination to get lat/lng
  - Uses Nearby Search for categories
  - Returns normalized items for UI consumption
*/

import { callPlacesProxy } from '../lib/placesProxy';

type LatLng = { lat: number; lng: number };

export type PlaceItem = {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  photoUrl?: string;
  priceLevel?: number;
  types?: string[];
  location: LatLng;
  // New enhanced fields
  website?: string;
  phoneNumber?: string;
  businessStatus?: string;
  reviews?: Array<{
    authorName: string;
    rating: number;
    text: string;
    time: string;
  }>;
  openingHours?: {
    openNow: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekdayText: string[];
  };
  editorialSummary?: string;
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions: Array<{
      displayName: string;
      uri: string;
      photoUri: string;
    }>;
  }>;
  // Additional metadata for better UX
  category?: string;
  distance?: number;
  isOpen?: boolean;
  priceRange?: string;
};

const photoUrl = (photoRef?: string, apiKey?: string) => {
  if (!photoRef || !apiKey) return undefined;
  // Use the new Places API photo endpoint
  return `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=400&key=${apiKey}`;
};

// Helper function to get price range from price level
const getPriceRange = (priceLevel?: number): string => {
  if (priceLevel === undefined || priceLevel === null) return '';
  switch (priceLevel) {
    case 0: return 'Free';
    case 1: return '$';
    case 2: return '$$';
    case 3: return '$$$';
    case 4: return '$$$$';
    default: return '';
  }
};

// Helper function to normalize API response data
const normalizePlaceData = (place: any, apiKey: string, category?: string): PlaceItem => {
  // Handle both new API and legacy API response formats
  const isNewAPI = place.displayName !== undefined;
  
  const baseData = {
    id: isNewAPI ? (place.id || place.place_id) : place.place_id,
    name: isNewAPI ? (place.displayName || place.name) : place.name,
    address: isNewAPI ? (place.formattedAddress || place.vicinity || '') : (place.vicinity || place.formatted_address || ''),
    rating: place.rating,
    userRatingsTotal: isNewAPI ? (place.userRatingCount || place.user_ratings_total) : place.user_ratings_total,
    photoUrl: isNewAPI ? 
      (place.photos?.[0]?.name ? 
        `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=400&key=${apiKey}` :
        undefined) :
      (place.photos?.[0]?.photo_reference ? 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}` :
        undefined),
    priceLevel: isNewAPI ? place.priceLevel : place.price_level,
    types: place.types,
    location: isNewAPI ? 
      (place.location ? {
        lat: place.location.latitude || place.location.lat,
        lng: place.location.longitude || place.location.lng
      } : place.geometry?.location) :
      place.geometry?.location,
    website: isNewAPI ? (place.websiteUri || place.website) : place.website,
    phoneNumber: isNewAPI ? (place.phoneNumber || place.formatted_phone_number) : place.formatted_phone_number,
    businessStatus: isNewAPI ? place.businessStatus : place.business_status,
    reviews: place.reviews?.map((review: any) => ({
      authorName: isNewAPI ? (review.authorAttribution?.displayName || review.author_name) : review.author_name,
      rating: review.rating,
      text: isNewAPI ? (review.text?.text || review.text) : review.text,
      time: isNewAPI ? (review.publishTime || review.time) : review.time
    })),
    openingHours: isNewAPI ? 
      (place.openingHours ? {
        openNow: place.openingHours.openNow,
        periods: place.openingHours.periods || [],
        weekdayText: place.openingHours.weekdayText || []
      } : place.opening_hours ? {
        openNow: place.opening_hours.open_now,
        periods: place.opening_hours.periods || [],
        weekdayText: place.opening_hours.weekday_text || []
      } : undefined) :
      (place.opening_hours ? {
        openNow: place.opening_hours.open_now,
        periods: place.opening_hours.periods || [],
        weekdayText: place.opening_hours.weekday_text || []
      } : undefined),
    editorialSummary: isNewAPI ? place.editorialSummary : place.editorial_summary,
    photos: place.photos,
    // Additional metadata
    category: category,
    isOpen: isNewAPI ? 
      (place.openingHours?.openNow ?? place.opening_hours?.open_now) :
      place.opening_hours?.open_now,
    priceRange: getPriceRange(isNewAPI ? place.priceLevel : place.price_level)
  };
  
  return baseData;
};

export async function geocodeDestination(destination: string, _apiKey: string): Promise<LatLng | null> {
  try {
    const data: any = await callPlacesProxy({ action: 'textsearch', query: destination });
    
    // Handle both new API and legacy API response formats
    const places = data?.places || data?.results || [];
    const first = places[0];
    
    if (!first) {
      return null;
    }
    
    // New API format
    if (first.location) {
      const location = {
        lat: first.location.latitude || first.location.lat,
        lng: first.location.longitude || first.location.lng
      };
      return location;
    }
    
    // Legacy API format
    const location = first.geometry?.location || null;
    return location;
  } catch (error) {
    return null;
  }
}

type NearbyCategory = 'attractions' | 'day_trips' | 'food_cafes' | 'hidden_gems';

const nearbyParamsByCategory: Record<NearbyCategory, { keyword?: string; type?: string; radius: number }[]> = {
  attractions: [
    // Specific attraction types only
    { type: 'tourist_attraction', radius: 15000 },
    { type: 'museum', radius: 15000 },
    { type: 'park', radius: 15000 },
    { type: 'amusement_park', radius: 15000 },
    { type: 'zoo', radius: 15000 },
    { type: 'art_gallery', radius: 15000 },
    { type: 'aquarium', radius: 15000 },
    { type: 'planetarium', radius: 15000 },
    // Specific attraction keywords
    { keyword: 'monument', radius: 20000 },
    { keyword: 'landmark', radius: 20000 },
    { keyword: 'historical site', radius: 20000 },
    { keyword: 'viewpoint', radius: 20000 },
  ],
  day_trips: [
    // Natural features and outdoor activities
    { type: 'natural_feature', radius: 60000 },
    { type: 'hindu_temple', radius: 60000 },
    { type: 'mosque', radius: 60000 },
    { type: 'church', radius: 60000 },
    { type: 'campground', radius: 60000 },
    { type: 'rv_park', radius: 60000 },
    // Specific day trip keywords
    { keyword: 'waterfall', radius: 60000 },
    { keyword: 'lake', radius: 60000 },
    { keyword: 'mountain', radius: 60000 },
    { keyword: 'valley', radius: 60000 },
    { keyword: 'beach', radius: 60000 },
    { keyword: 'hiking trail', radius: 60000 },
    { keyword: 'nature reserve', radius: 60000 },
  ],
  food_cafes: [
    // Only food and beverage establishments
    { type: 'restaurant', radius: 12000 },
    { type: 'cafe', radius: 12000 },
    { type: 'bar', radius: 12000 },
    { type: 'bakery', radius: 12000 },
    { type: 'food', radius: 12000 },
    { type: 'meal_takeaway', radius: 12000 },
    { type: 'meal_delivery', radius: 12000 },
    // Specific food keywords
    { keyword: 'restaurant', radius: 15000 },
    { keyword: 'cafe', radius: 15000 },
    { keyword: 'dining', radius: 15000 },
    { keyword: 'street food', radius: 15000 },
    { keyword: 'local cuisine', radius: 15000 },
    { keyword: 'food court', radius: 15000 },
  ],
  hidden_gems: [
    // Unique and lesser-known places
    { keyword: 'hidden gem', radius: 30000 },
    { keyword: 'secret spot', radius: 30000 },
    { keyword: 'off the beaten path', radius: 30000 },
    { keyword: 'local favorite', radius: 30000 },
    { keyword: 'undiscovered', radius: 30000 },
    { keyword: 'unique experience', radius: 30000 },
    { keyword: 'local secret', radius: 30000 },
    // Broader search for hidden gems
    { keyword: 'unusual place', radius: 40000 },
    { keyword: 'special place', radius: 40000 },
  ],
};

export async function nearbyByCategory(
  location: LatLng,
  category: NearbyCategory,
  apiKey: string,
  limit: number = 6
): Promise<PlaceItem[]> {
  const searchParams = nearbyParamsByCategory[category];
  const allResults: PlaceItem[] = [];
  
  // Try each search parameter sequentially to get the best results
  for (const params of searchParams) {
    try {
      const data: any = await callPlacesProxy({
        action: 'nearby',
        latitude: location.lat,
        longitude: location.lng,
        radius: params.radius,
        type: params.type,
        keyword: params.keyword,
      });
      
      // Handle both new API and legacy API response formats
      const places = data?.places || data?.results || [];
      const items: PlaceItem[] = places.map((r: any) => normalizePlaceData(r, apiKey, category));
      
      // Add new items to results
      for (const item of items) {
        if (!allResults.find(existing => existing.id === item.id)) {
          allResults.push(item);
        }
      }
      
      // If we have enough good results, break early
      if (allResults.length >= limit * 2) {
        break;
      }
    } catch (error) {
      // Continue to next search parameter
    }
  }
  
  // If we still don't have enough results, try a broader text search
  if (allResults.length < limit) {
    try {
      const searchText = `${category.replace('_', ' ')} near ${location.lat},${location.lng}`;
      const data: any = await callPlacesProxy({
        action: 'textsearch',
        query: searchText,
      });
      
      const places = data?.places || data?.results || [];
      const items: PlaceItem[] = places.map((r: any) => normalizePlaceData(r, apiKey, category));
      
      // Add new items to results
      for (const item of items) {
        if (!allResults.find(existing => existing.id === item.id)) {
          allResults.push(item);
        }
      }
    } catch (error) {
      // Text search failed, continue
    }
  }
  
  // Filter and sort results with category-specific filtering
  const filteredPlaces = allResults.filter(place => {
    // Must have a valid name and address
    if (!place.name || !place.address) {
      return false;
    }
    
    // Require high ratings (4.0+) and minimum reviews (10+)
    if (!place.rating || place.rating < 4.0 || !place.userRatingsTotal || place.userRatingsTotal < 10) {
      return false;
    }
    
    // Require photos for better user experience
    if (!place.photoUrl) {
      return false;
    }
    
    // Category-specific filtering to prevent cross-contamination
    const placeTypes = place.types || [];
    const placeName = place.name.toLowerCase();
    const placeAddress = place.address.toLowerCase();
    
    switch (category) {
      case 'attractions':
        // Only allow tourist attractions, museums, parks, etc.
        const attractionTypes = ['tourist_attraction', 'museum', 'park', 'amusement_park', 'zoo', 'art_gallery', 'aquarium', 'planetarium'];
        const attractionKeywords = ['monument', 'landmark', 'historical', 'viewpoint', 'attraction', 'site'];
        return attractionTypes.some(type => placeTypes.includes(type)) || 
               attractionKeywords.some(keyword => placeName.includes(keyword) || placeAddress.includes(keyword));
               
      case 'day_trips':
        // Allow natural features, religious sites, campgrounds, outdoor activities
        const dayTripTypes = ['natural_feature', 'hindu_temple', 'mosque', 'church', 'campground', 'rv_park'];
        const dayTripKeywords = ['waterfall', 'lake', 'mountain', 'valley', 'beach', 'trail', 'reserve', 'temple', 'monastery'];
        return dayTripTypes.some(type => placeTypes.includes(type)) || 
               dayTripKeywords.some(keyword => placeName.includes(keyword) || placeAddress.includes(keyword));
               
      case 'food_cafes':
        // Only allow food and beverage establishments
        const foodTypes = ['restaurant', 'cafe', 'bar', 'bakery', 'food', 'meal_takeaway', 'meal_delivery'];
        const foodKeywords = ['restaurant', 'cafe', 'dining', 'food', 'kitchen', 'bistro', 'eatery', 'grill', 'pizza', 'burger'];
        return foodTypes.some(type => placeTypes.includes(type)) || 
               foodKeywords.some(keyword => placeName.includes(keyword) || placeAddress.includes(keyword));
               
      case 'hidden_gems':
        // Allow unique places, but exclude common commercial establishments
        const excludeTypes = ['lodging', 'travel_agency', 'car_rental', 'gas_station', 'atm', 'bank', 'hospital', 'pharmacy'];
        const excludeKeywords = ['hotel', 'resort', 'rental', 'agency', 'station', 'atm', 'bank', 'hospital', 'pharmacy', 'store', 'shop'];
        
        // Exclude if it's a common commercial establishment
        if (excludeTypes.some(type => placeTypes.includes(type)) || 
            excludeKeywords.some(keyword => placeName.includes(keyword) || placeAddress.includes(keyword))) {
          return false;
        }
        
        // Include if it has unique characteristics
        const uniqueKeywords = ['hidden', 'secret', 'unique', 'special', 'unusual', 'local', 'authentic', 'traditional'];
        return uniqueKeywords.some(keyword => placeName.includes(keyword) || placeAddress.includes(keyword)) ||
               placeTypes.some(type => ['tourist_attraction', 'natural_feature', 'museum', 'art_gallery'].includes(type));
               
      default:
        return true;
    }
  });
  
  // Sort by rating (higher first) and then by number of reviews (more first)
  const sortedPlaces = filteredPlaces.sort((a, b) => {
    // First sort by rating (descending) - prioritize 4.5+ ratings
    const ratingDiff = (b.rating || 0) - (a.rating || 0);
    if (Math.abs(ratingDiff) > 0.1) {
      return ratingDiff;
    }
    
    // If ratings are similar, sort by number of reviews (descending)
    const reviewDiff = (b.userRatingsTotal || 0) - (a.userRatingsTotal || 0);
    if (reviewDiff !== 0) {
      return reviewDiff;
    }
    
    // Finally, prioritize places with more photos
    const photoDiff = (b.photos?.length || 0) - (a.photos?.length || 0);
    return photoDiff;
  });
  
  // Limit to specified number of places
  return sortedPlaces.slice(0, limit);
}

export async function fetchAllCategoriesForDestination(destination: string, apiKey: string, limit: number = 6) {
  try {
    const loc = await geocodeDestination(destination, apiKey);
    if (!loc) {
      return { attractions: [], day_trips: [], food_cafes: [], hidden_gems: [] };
    }
    
    const [attractions, dayTrips, foodCafes, hiddenGems] = await Promise.allSettled([
      nearbyByCategory(loc, 'attractions', apiKey, limit),
      nearbyByCategory(loc, 'day_trips', apiKey, limit),
      nearbyByCategory(loc, 'food_cafes', apiKey, limit),
      nearbyByCategory(loc, 'hidden_gems', apiKey, limit),
    ]);
    
    return { 
      attractions: attractions.status === 'fulfilled' ? attractions.value : [],
      day_trips: dayTrips.status === 'fulfilled' ? dayTrips.value : [],
      food_cafes: foodCafes.status === 'fulfilled' ? foodCafes.value : [],
      hidden_gems: hiddenGems.status === 'fulfilled' ? hiddenGems.value : []
    };
  } catch (error) {
    return { attractions: [], day_trips: [], food_cafes: [], hidden_gems: [] };
  }
}

// Suggest places similar to a given place. Uses a nearby search around the place
// location using either its primary type or a keyword derived from its name.
export async function similarPlacesByPlace(
  base: PlaceItem,
  apiKey: string,
  limit: number = 10
): Promise<PlaceItem[]> {
  try {
    const keyword = (base.types && base.types.length > 0)
      ? base.types[0]
      : base.name?.split(/[\s,\-]/)[0];

    const data: any = await callPlacesProxy({
      action: 'nearby',
      latitude: base.location.lat,
      longitude: base.location.lng,
      radius: 20000,
      keyword,
    });

    // Handle both new API and legacy API response formats
    const places = data?.places || data?.results || [];
    const items: PlaceItem[] = places.map((r: any) => normalizePlaceData(r, apiKey));

    // Deduplicate and filter out the base item
    const unique = new Map<string, PlaceItem>();
    for (const it of items) {
      if (it.id !== base.id && !unique.has(it.id)) unique.set(it.id, it);
    }

    // Quality filter (similar to nearbyByCategory)
    const filtered = Array.from(unique.values()).filter(p =>
      !!p.rating && !!p.userRatingsTotal && p.userRatingsTotal >= 5 && !!p.photoUrl && !!p.name && !!p.address
    );

    // Sort by rating then reviews
    filtered.sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (Math.abs(ratingDiff) > 0.1) return ratingDiff;
      return (b.userRatingsTotal || 0) - (a.userRatingsTotal || 0);
    });

    return filtered.slice(0, limit);
  } catch (error) {
    return [];
  }
}


