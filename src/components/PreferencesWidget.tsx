import { useEffect, useState, useMemo } from 'react';
import { fetchAllCategoriesForDestination, PlaceItem, geocodeDestination, nearbyByCategory } from '../database/googlePlaces';
import { Heart, ChevronRight, Info } from 'lucide-react';

type Props = {
  destination: string;
  onComplete: (pickedIds: string[]) => void;
};

type TabKey = 'attractions' | 'day_trips' | 'food_cafes' | 'hidden_gems';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'attractions', label: 'Attractions' },
  { key: 'day_trips', label: 'Day Trips' },
  { key: 'food_cafes', label: 'Food & Cafes' },
  { key: 'hidden_gems', label: 'Hidden Gems' },
];

const PreferencesWidget = ({ destination, onComplete }: Props) => {
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
  const [showMore, setShowMore] = useState<Record<TabKey, boolean>>({
    attractions: false,
    day_trips: false,
    food_cafes: false,
    hidden_gems: false
  });

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!destination || !apiKey) return;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchAllCategoriesForDestination(destination, apiKey, 6);
        if (!cancelled) setData(result as any);
      } catch (e) {
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
      }
    } catch (e) {
      setError('Failed to load more places.');
    } finally {
      setLoading(false);
    }
  };

  const items = useMemo(() => data[active] || [], [data, active]);

  const toggle = (id: string) => {
    const newPicked = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id];
    setPicked(newPicked);
    
    // Load more places if user has selected preferences and we haven't loaded more yet
    if (newPicked.length > 0 && !showMore[active]) {
      loadMorePlaces(active);
    }
  };

  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Pick What You Love 
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
          </h3>
          <button className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            Skip this step &gt;&gt;
          </button>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
          Follow your inspiration — Airial will connect the dots and create a journey filled with moments that feel just right.
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
                  onClick={() => toggle(place.id)}
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
                    <div className="absolute top-2 right-2">
                      <Heart 
                        className={`w-5 h-5 transition-all duration-300 ${
                          picked.includes(place.id)
                            ? 'text-pink-500 fill-pink-500 scale-110'
                            : 'text-white/80 hover:text-pink-300 hover:scale-110'
                        }`}
                      />
                    </div>
                    
                    {/* Info Icon */}
                    <div className="absolute bottom-2 right-2">
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
                    
                    {/* Rating */}
                    {place.rating && (
                      <div className="mt-2 flex items-center gap-2">
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

        {/* Bottom Section */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              Save one or more experiences to Continue
            </div>
            
            <button
              onClick={() => onComplete(picked)}
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
    </div>
  );
};

export default PreferencesWidget;



