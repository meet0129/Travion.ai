import { useEffect, useState, useMemo } from 'react';
import { fetchAllCategoriesForDestination, PlaceItem, geocodeDestination, nearbyByCategory, similarPlacesByPlace } from '../database/googlePlaces';
import { Heart, ChevronRight, Info } from 'lucide-react';
import PlaceDetailDialog from './PlaceDetailDialog';
import { debugEnvironment } from '../lib/debug-env';
import '../lib/test-api-call';
import '../lib/verify-setup';

type Props = {
  destination: string;
  onComplete: (pickedIds: string[]) => void;
  onPreferencesChange?: (preferences: any[]) => void;
};

type TabKey = 'attractions' | 'day_trips' | 'food_cafes' | 'hidden_gems';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'attractions', label: 'Attractions' },
  { key: 'day_trips', label: 'Day Trips' },
  { key: 'food_cafes', label: 'Food & Cafes' },
  { key: 'hidden_gems', label: 'Hidden Gems' },
];

const PreferencesWidget = ({ destination, onComplete, onPreferencesChange }: Props) => {
  const [active, setActive] = useState<TabKey>('attractions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<TabKey, PlaceItem[]>>({
    attractions: [],
    day_trips: [],
    food_cafes: [],
    hidden_gems: []
  });
  const [picked, setPicked] = useState<string[]>([]);
  const [pickedPlaces, setPickedPlaces] = useState<Record<string, PlaceItem>>({});
  const [showMore, setShowMore] = useState<Record<TabKey, boolean>>({
    attractions: false,
    day_trips: false,
    food_cafes: false,
    hidden_gems: false
  });

  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string | undefined;

  // Initialize with previously selected preferences
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('selectedPreferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        const pickedIds = preferences.map(p => p.id);
        const pickedPlacesMap = {};
        preferences.forEach(p => {
          pickedPlacesMap[p.id] = p;
        });
        setPicked(pickedIds);
        setPickedPlaces(pickedPlacesMap);
        
        // Notify parent about loaded preferences
        if (onPreferencesChange) {
          onPreferencesChange(preferences);
        }
      }
    } catch (error) {
      console.error('Error loading saved preferences:', error);
    }
  }, [onPreferencesChange]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // Debug environment variables
      debugEnvironment();
      
      if (!destination || !apiKey) {
        return;
      }

      // Check cache first
      const cacheKey = `preferences_${destination}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          // Check if cache is less than 24 hours old
          const cacheTime = parsedData.timestamp;
          const now = Date.now();
          const twentyFourHours = 24 * 60 * 60 * 1000;
          
          if (now - cacheTime < twentyFourHours) {
            setData(parsedData.data);
            return;
          }
        } catch (error) {
          console.error('Error parsing cached data:', error);
        }
      }

      setLoading(true);
      setError(null);
      try {
        const result = await fetchAllCategoriesForDestination(destination, apiKey, 6);
        if (!cancelled) {
          setData(result as any);
          
          // Cache the result
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              data: result,
              timestamp: Date.now()
            }));
          } catch (error) {
            console.error('Error caching preferences data:', error);
          }
        }
      } catch (e) {
        console.error('❌ API call failed:', e);
        if (!cancelled) setError('Failed to load places for this destination.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [destination, apiKey]);

  // Load more places when user selects preferences
  const loadMorePlaces = async (category: TabKey) => {
    if (!destination || !apiKey || showMore[category]) return;
    
    // Check cache for "more places" data
    const moreCacheKey = `preferences_more_${destination}_${category}`;
    const cachedMoreData = localStorage.getItem(moreCacheKey);
    
    if (cachedMoreData) {
      try {
        const parsedData = JSON.parse(cachedMoreData);
        const cacheTime = parsedData.timestamp;
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (now - cacheTime < twentyFourHours) {
          setData(prev => ({
            ...prev,
            [category]: parsedData.data
          }));
          setShowMore(prev => ({
            ...prev,
            [category]: true
          }));
          return;
        }
      } catch (error) {
        console.error('Error parsing cached more data:', error);
      }
    }
    
    setLoading(true);
    try {
      const loc = await geocodeDestination(destination, apiKey);
      if (loc) {
        const morePlaces = await nearbyByCategory(loc, category, apiKey, 7);
        setData(prev => ({
          ...prev,
          [category]: morePlaces
        }));
        setShowMore(prev => ({
          ...prev,
          [category]: true
        }));
        
        // Cache the more places data
        try {
          localStorage.setItem(moreCacheKey, JSON.stringify({
            data: morePlaces,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('Error caching more places data:', error);
        }
      }
    } catch (e) {
      setError('Failed to load more places.');
    } finally {
      setLoading(false);
    }
  };

  const items = useMemo(() => data[active] || [], [data, active]);
  const [openPlace, setOpenPlace] = useState<PlaceItem | null>(null);

  const toggle = (id: string) => {
    const list = data[active] || [];
    const place = list.find(p => p.id === id);
    const isCurrentlyPicked = picked.includes(id);
    const newPicked = isCurrentlyPicked ? picked.filter((x) => x !== id) : [...picked, id];
    
    setPicked(newPicked);
    
    // Update pickedPlaces
    if (place && !isCurrentlyPicked) {
      setPickedPlaces(prev => ({ ...prev, [place.id]: place }));
    } else if (isCurrentlyPicked) {
      setPickedPlaces(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
    
    // Update localStorage immediately for real-time sync
    const updatedPlaces = isCurrentlyPicked 
      ? Object.values(pickedPlaces).filter(p => p.id !== id)
      : place 
        ? [...Object.values(pickedPlaces).filter(p => p.id !== id), place]
        : Object.values(pickedPlaces).filter(p => p.id !== id);
    
    try {
      localStorage.setItem('selectedPreferences', JSON.stringify(updatedPlaces));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
    
    // Call onPreferencesChange to sync with parent component
    if (onPreferencesChange) {
      onPreferencesChange(updatedPlaces);
    }
    
    // Load more places if user has selected preferences and we haven't loaded more yet
    if (newPicked.length > 0 && !showMore[active]) {
      loadMorePlaces(active);
    }
  };

  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Pick What You Love 
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
          </h3>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
          Follow your inspiration — Travion will connect the dots and create a journey filled with moments that feel just right.
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                active === t.key
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {destination}: {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 text-sm rounded-md border border-red-200 text-red-700 dark:border-red-900 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Horizontal Scrolling Cards */}
        <div className="relative">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="text-sm text-slate-500">Loading places…</div>
            </div>
          )}
          
          {!loading && (
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {items.map((place, index) => (
                <div
                  key={place.id}
                  className={`group relative flex-shrink-0 w-64 bg-white dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl border-2 ${
                    picked.includes(place.id) 
                      ? 'border-pink-500 ring-2 ring-pink-200 dark:ring-pink-800' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-600'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setOpenPlace(place)}
                >
                  {/* Image Container */}
                  <div className="relative w-full h-36 bg-slate-100 dark:bg-slate-700">
                    {place.photoUrl ? (
                      <img 
                        src={place.photoUrl} 
                        alt={place.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700">
                        <span className="text-slate-500 dark:text-slate-400 text-sm">No photo available</span>
                      </div>
                    )}
                    
                    {/* Heart Selection Icon */}
                    <button
                      className="absolute top-2 right-2"
                      onClick={(e) => { e.stopPropagation(); toggle(place.id); }}
                      aria-label={picked.includes(place.id) ? 'Unsave' : 'Save'}
                    >
                      <Heart 
                        className={`w-5 h-5 transition-all duration-300 ${
                          picked.includes(place.id)
                            ? 'text-pink-500 fill-pink-500 scale-110'
                            : 'text-white/80 hover:text-pink-300 hover:scale-110'
                        }`}
                      />
                    </button>
                    
                    {/* Info Icon */}
                    <div className="absolute bottom-2 right-2 pointer-events-none">
                      <div className="w-6 h-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Info className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1 line-clamp-1">
                      {place.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {place.address}
                    </p>
                    
                    {/* Rating and Metadata */}
                    {place.rating && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500 text-xs">★</span>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {place.rating.toFixed(1)}
                            </span>
                          </div>
                          {place.userRatingsTotal && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              ({place.userRatingsTotal > 1000 ? Math.floor(place.userRatingsTotal/1000) + 'k' : place.userRatingsTotal})
                            </span>
                          )}
                        </div>
                        
                        {/* Additional Metadata */}
                        <div className="flex items-center gap-2 text-xs">
                          {/* Price Range */}
                          {place.priceRange && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                              {place.priceRange}
                            </span>
                          )}
                          
                          {/* Open Status */}
                          {place.isOpen !== undefined && (
                            <span className={`px-2 py-1 rounded-full font-medium ${
                              place.isOpen 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}>
                              {place.isOpen ? 'Open' : 'Closed'}
                            </span>
                          )}
                          
                          {/* Business Status */}
                          {place.businessStatus && place.businessStatus !== 'OPERATIONAL' && (
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-medium">
                              {place.businessStatus.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More Button */}
        {!loading && items.length > 0 && !showMore[active] && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => loadMorePlaces(active)}
              className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
            >
              Show More Places
            </button>
          </div>
        )}

        {/* Similar to picked tab */}
        {picked.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">More like your picks</div>
              <button
                className="text-xs text-purple-600 hover:underline"
                onClick={async () => {
                  if (!apiKey) return;
                  const firstPicked = pickedPlaces[picked[0]];
                  if (!firstPicked) return;
                  const similar = await similarPlacesByPlace(firstPicked, apiKey, 10);
                  // Keep 10 visible at most
                  setData(prev => ({
                    ...prev,
                    [active]: [...similar.slice(0, 10)]
                  }));
                  setShowMore(prev => ({ ...prev, [active]: true }));
                }}
              >
                Suggest similar
              </button>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              Save one or more experiences to Continue
            </div>
            
            <button
              onClick={() => {
                const selected = picked.map(id => pickedPlaces[id]).filter(Boolean);
                  // Persist globally and per-chat for real-time sync with Destinations and chat sessions
                try {
                  localStorage.setItem('selectedPreferences', JSON.stringify(selected));
                  const currentChatId = sessionStorage.getItem('currentChatId');
                  if (currentChatId) {
                    sessionStorage.setItem(`selectedPreferences_${currentChatId}`, JSON.stringify(selected));
                  }
                } catch {}
                onComplete(picked);
              }}
              disabled={picked.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                picked.length > 0
                  ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl active:scale-95 transform'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {openPlace && apiKey && (
        <PlaceDetailDialog
          place={openPlace}
          apiKey={apiKey}
          onClose={() => setOpenPlace(null)}
        />
      )}
    </div>
  );
};

export default PreferencesWidget;



