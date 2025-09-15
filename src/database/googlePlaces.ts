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
};

const photoUrl = (photoRef?: string, apiKey?: string) => {
  if (!photoRef || !apiKey) return undefined;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`;
};

export async function geocodeDestination(destination: string, _apiKey: string): Promise<LatLng | null> {
  const data: any = await callPlacesProxy({ action: 'textsearch', query: destination });
  const first = data?.results?.[0];
  return first?.geometry?.location || null;
}

type NearbyCategory = 'attractions' | 'day_trips' | 'food_cafes' | 'hidden_gems';

const nearbyParamsByCategory: Record<NearbyCategory, { keyword?: string; type?: string; radius: number }[]> = {
  attractions: [
    // Prioritize travel-related attractions first
    { type: 'tourist_attraction', radius: 15000 },
    { type: 'museum', radius: 15000 },
    { type: 'park', radius: 15000 },
    { type: 'amusement_park', radius: 15000 },
    { type: 'zoo', radius: 15000 },
  ],
  day_trips: [
    // Focus on travel destinations and natural features
    { type: 'natural_feature', radius: 60000 },
    { type: 'hindu_temple', radius: 60000 },
    { keyword: 'day trip destination', radius: 60000 },
    { keyword: 'scenic spot', radius: 60000 },
    { type: 'campground', radius: 60000 },
  ],
  food_cafes: [
    { type: 'restaurant', radius: 12000 },
    { type: 'cafe', radius: 12000 },
    { keyword: 'street food', radius: 12000 },
    { keyword: 'local cuisine', radius: 12000 },
  ],
  hidden_gems: [
    { keyword: 'hidden gem', radius: 30000 },
    { keyword: 'less crowded place', radius: 30000 },
    { keyword: 'off the beaten path', radius: 30000 },
  ],
};

export async function nearbyByCategory(
  location: LatLng,
  category: NearbyCategory,
  apiKey: string,
  limit: number = 6
): Promise<PlaceItem[]> {
  const tasks = nearbyParamsByCategory[category].map(async (p) => {
    const data: any = await callPlacesProxy({
      action: 'nearby',
      latitude: location.lat,
      longitude: location.lng,
      radius: p.radius,
      type: p.type,
      keyword: p.keyword,
    });
    const items: PlaceItem[] = (data?.results || []).map((r: any) => ({
      id: r.place_id,
      name: r.name,
      address: r.vicinity || r.formatted_address || '',
      rating: r.rating,
      userRatingsTotal: r.user_ratings_total,
      photoUrl: photoUrl(r.photos?.[0]?.photo_reference, apiKey),
      priceLevel: r.price_level,
      types: r.types,
      location: r.geometry?.location,
    }));
    return items;
  });

  const results = (await Promise.all(tasks)).flat();
  
  // Deduplicate by place_id
  const map = new Map<string, PlaceItem>();
  for (const it of results) {
    if (!map.has(it.id)) map.set(it.id, it);
  }
  
  const allPlaces = Array.from(map.values());
  
  // Filter out places without reviews or photos, and prioritize quality
  const filteredPlaces = allPlaces.filter(place => {
    // Must have rating and at least some reviews
    if (!place.rating || !place.userRatingsTotal || place.userRatingsTotal < 5) {
      return false;
    }
    
    // Prefer places with photos
    if (!place.photoUrl) {
      return false;
    }
    
    // Must have a valid name and address
    if (!place.name || !place.address) {
      return false;
    }
    
    return true;
  });
  
  // Sort by rating (higher first) and then by number of reviews (more first)
  const sortedPlaces = filteredPlaces.sort((a, b) => {
    // First sort by rating (descending)
    const ratingDiff = (b.rating || 0) - (a.rating || 0);
    if (Math.abs(ratingDiff) > 0.1) {
      return ratingDiff;
    }
    
    // If ratings are similar, sort by number of reviews (descending)
    return (b.userRatingsTotal || 0) - (a.userRatingsTotal || 0);
  });
  
  // Limit to specified number of places
  return sortedPlaces.slice(0, limit);
}

export async function fetchAllCategoriesForDestination(destination: string, apiKey: string, limit: number = 6) {
  const loc = await geocodeDestination(destination, apiKey);
  if (!loc) return { attractions: [], day_trips: [], food_cafes: [], hidden_gems: [] };
  const [attractions, dayTrips, foodCafes, hiddenGems] = await Promise.all([
    nearbyByCategory(loc, 'attractions', apiKey, limit),
    nearbyByCategory(loc, 'day_trips', apiKey, limit),
    nearbyByCategory(loc, 'food_cafes', apiKey, limit),
    nearbyByCategory(loc, 'hidden_gems', apiKey, limit),
  ]);
  return { attractions, day_trips: dayTrips, food_cafes: foodCafes, hidden_gems: hiddenGems };
}


