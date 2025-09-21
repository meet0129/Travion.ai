import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Sidebar from '@/components/Sidebar';
import MapEmbed from '@/components/MapEmbed';
import PreferencesFolded from '@/components/PreferencesFolded';
import { useTrips } from '@/contexts/TripsContext';
import { 
  Plus, 
  X, 
  Users, 
  ChevronDown, 
  Settings, 
  MapPin, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw,
  Loader2
} from 'lucide-react';
import { PlaceItem, fetchAllCategoriesForDestination, nearbyByCategory, similarPlacesByPlace } from '@/database/googlePlaces';
import { v4 as uuidv4 } from 'uuid';

interface DestinationsProps {
  tripData?: any;
  onComplete?: (tripData: any) => void;
}

const Destinations: React.FC<DestinationsProps> = ({ tripData: propTripData, onComplete }) => {
  const [tripData, setTripData] = useState(propTripData || {
    destination: '',
    travelers: 2,
    startDate: '',
    endDate: '',
    preferences: []
  });
  const [startDestination, setStartDestination] = useState("Ahmedabad");
  const [endDestination, setEndDestination] = useState("Ahmedabad");
  const [selectedDestinations, setSelectedDestinations] = useState<PlaceItem[]>([]);
  const [suggestedDestinations, setSuggestedDestinations] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string | undefined;
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const { saveTrip } = useTrips();

  // Generate or get chatId
  const getOrCreateChatId = () => {
    const stored = sessionStorage.getItem('currentChatId');
    if (stored) return stored;
    const newId = uuidv4();
    sessionStorage.setItem('currentChatId', newId);
    return newId;
  };

  const chatId = getOrCreateChatId();

  // Load trip data from props or localStorage
  useEffect(() => {
    if (propTripData) {
      setTripData(propTripData);
      setStartDestination(propTripData.startLocation || "Ahmedabad");
      setEndDestination(propTripData.destination || "Ahmedabad");
    } else {
      const stored = localStorage.getItem(`tripData_${chatId}`);
      if (stored) {
        const data = JSON.parse(stored);
        setTripData(data);
        setStartDestination(data.startLocation || "Ahmedabad");
        setEndDestination(data.destination || "Ahmedabad");
      } else {
        // No stored data for this chat - start fresh
        setSelectedDestinations([]);
        setSuggestedDestinations([]);
      }
    }
  }, [propTripData, chatId]);

  // Restore persisted destinations/suggestions on refresh (destination-specific)
  useEffect(() => {
    try {
      const destinationKey = tripData.destination ? `_${tripData.destination.replace(/\s+/g, '_')}` : '';
      const persistedSelected = sessionStorage.getItem(`dest_selected_${chatId}${destinationKey}`);
      const persistedSuggested = sessionStorage.getItem(`dest_suggested_${chatId}${destinationKey}`);
      const persistedUi = sessionStorage.getItem(`dest_ui_${chatId}${destinationKey}`);
      
      // Only restore if we have a valid destination and the data exists
      if (tripData.destination && persistedSelected) {
        setSelectedDestinations(JSON.parse(persistedSelected));
      }
      if (tripData.destination && persistedSuggested) {
        setSuggestedDestinations(JSON.parse(persistedSuggested));
      }
      if (persistedUi) {
        const ui = JSON.parse(persistedUi);
        // Always start with suggestions hidden by default
        // if (typeof ui.showSuggestions === 'boolean') setShowSuggestions(ui.showSuggestions);
        if (ui.startDestination) setStartDestination(ui.startDestination);
        if (ui.endDestination) setEndDestination(ui.endDestination);
      }
      
      // If no persisted data and we have a destination, start loading
      if (tripData.destination && !persistedSelected) {
        setInitialLoading(true);
      } else if (tripData.destination && persistedSelected) {
        setInitialLoading(false);
      }
    } catch {}
  }, [chatId, tripData.destination]);

  // Persist destinations/suggestions/ui state (destination-specific)
  useEffect(() => {
    try {
      const destinationKey = tripData.destination ? `_${tripData.destination.replace(/\s+/g, '_')}` : '';
      sessionStorage.setItem(`dest_selected_${chatId}${destinationKey}`, JSON.stringify(selectedDestinations));
    } catch {}
  }, [selectedDestinations, chatId, tripData.destination]);

  useEffect(() => {
    try {
      const destinationKey = tripData.destination ? `_${tripData.destination.replace(/\s+/g, '_')}` : '';
      sessionStorage.setItem(`dest_suggested_${chatId}${destinationKey}`, JSON.stringify(suggestedDestinations));
    } catch {}
  }, [suggestedDestinations, chatId, tripData.destination]);

  useEffect(() => {
    try {
      const destinationKey = tripData.destination ? `_${tripData.destination.replace(/\s+/g, '_')}` : '';
      sessionStorage.setItem(`dest_ui_${chatId}${destinationKey}`, JSON.stringify({ showSuggestions, startDestination, endDestination }));
    } catch {}
  }, [showSuggestions, startDestination, endDestination, chatId, tripData.destination]);

  // Load initial destinations based on preferences
  const loadInitialDestinations = async () => {
    if (!apiKey || !tripData.destination) {
      setInitialLoading(false);
      return;
    }
    
    setInitialLoading(true);
    setLoading(true);
    // Clear any existing destinations to prevent showing random places
    setSelectedDestinations([]);
    setSuggestedDestinations([]);
    
    try {
      // Get chat-specific preferences only
      const currentChatId = sessionStorage.getItem('currentChatId');
      const selectedPreferences = currentChatId 
        ? JSON.parse(localStorage.getItem(`selectedPreferences_${currentChatId}`) || '[]')
        : [];
      
      const allPlacesData = await fetchAllCategoriesForDestination(tripData.destination, apiKey);
      
      // Filter and flatten places based on selected preferences
      const filteredPlaces = Object.entries(allPlacesData)
        .filter(([category, places]) => selectedPreferences.includes(category))
        .flatMap(([category, places]) => places)
        .filter(place => place.name && place.address && place.rating >= 4.0 && place.photoUrl)
        .slice(0, 3); // Take top 3 places
      
      setSelectedDestinations(filteredPlaces);
    } catch (error) {
      // Error loading destinations - keep destinations empty
      setSelectedDestinations([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Sync from Preferences (real-time) — add newly picked places while on destinations
  const syncFromPreferences = () => {
    try {
      // Get chat-specific preferences only
      const currentChatId = sessionStorage.getItem('currentChatId');
      if (currentChatId) {
        const storageKey = `selectedPreferences_${currentChatId}`;
        const picked: PlaceItem[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!Array.isArray(picked)) return;
        const newOnes = picked.filter(p => !selectedDestinations.some(d => d.id === p.id));
        if (newOnes.length > 0) {
          setSelectedDestinations(prev => [...prev, ...newOnes]);
          setSuggestedDestinations(prev => prev.filter(p => !newOnes.some(n => n.id === p.id)));
        }
      }
    } catch {}
  };

  // Listen for preference changes (within same tab via polling micro-task + storage for cross-tab)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'selectedPreferences' || e.key?.startsWith('selectedPreferences_')) syncFromPreferences();
    };
    window.addEventListener('storage', onStorage);
    // Immediate sync on mount and whenever tripData.preferences changes from parent
    syncFromPreferences();
    return () => window.removeEventListener('storage', onStorage);
  }, [selectedDestinations]);

  // React to parent-provided preferences in real-time (e.g., when inside Chat)
  useEffect(() => {
    if (propTripData?.preferences && Array.isArray(propTripData.preferences)) {
      const incoming: PlaceItem[] = propTripData.preferences as PlaceItem[];
      const toAdd = incoming.filter(p => !selectedDestinations.some(d => d.id === p.id));
      if (toAdd.length > 0) {
        setSelectedDestinations(prev => [...prev, ...toAdd]);
        setSuggestedDestinations(prev => prev.filter(p => !toAdd.some(n => n.id === p.id)));
      }
    }
  }, [propTripData?.preferences]);

  // Load suggestions based on selected places
  const loadSuggestions = async (limit: number = 10) => {
    if (!apiKey || !tripData.destination) return;
    
    setLoadingSuggestions(true);
    try {
      let suggestions: PlaceItem[] = [];
      
      if (selectedDestinations.length > 0) {
        // Get similar places based on selected destinations
        const similarPromises = selectedDestinations.slice(0, 2).map(place => 
          similarPlacesByPlace(place, apiKey, 5)
        );
        const similarResults = await Promise.all(similarPromises);
        suggestions = similarResults.flat()
          .filter(place => place.name && place.address && place.rating >= 4.0 && place.photoUrl)
          .filter(place => !selectedDestinations.some(selected => selected.id === place.id));
      }
      
      // If not enough suggestions, get general places
      if (suggestions.length < limit) {
      const allPlacesData = await fetchAllCategoriesForDestination(tripData.destination, apiKey);
      const allPlaces = Object.values(allPlacesData).flat();
        const generalPlaces = allPlaces
        .filter(place => place.name && place.address && place.rating >= 4.0 && place.photoUrl)
        .filter(place => !selectedDestinations.some(selected => selected.id === place.id))
          .filter(place => !suggestions.some(s => s.id === place.id))
          .slice(0, limit - suggestions.length);
        
        suggestions = [...suggestions, ...generalPlaces];
      }
      
      const finalSuggestions = suggestions.slice(0, limit);
      setSuggestedDestinations(finalSuggestions);
    } catch (error) {
      // Error loading suggestions
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Load nearby places
  const loadNearbyPlaces = async () => {
    if (!apiKey) return;
    const need = Math.max(0, 7 - suggestedDestinations.length);
    if (need === 0) return;

    setLoadingSuggestions(true);
    try {
      if (selectedDestinations.length > 0) {
        const centerPlace = selectedDestinations[0];
        const nearbyPlaces = await nearbyByCategory(
          centerPlace.location,
          'attractions',
          apiKey,
          need
        );
        setSuggestedDestinations(prev => [...prev, ...nearbyPlaces]);
      }
    } catch (error) {
      console.error('Error loading nearby places:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Replenish with similar places to maintain 10 suggestions
  const replenishWithSimilar = async (addedPlace: PlaceItem) => {
    if (!apiKey) return;
    try {
      const currentCount = suggestedDestinations.length;
      const needed = Math.max(0, 10 - currentCount);
      
      if (needed > 0) {
        const similarPlaces = await similarPlacesByPlace(addedPlace, apiKey, needed + 2);
        const filteredPlaces = similarPlaces
          .filter(place => place.name && place.address && place.rating >= 4.0 && place.photoUrl)
          .filter(place => !selectedDestinations.some(selected => selected.id === place.id))
          .filter(place => !suggestedDestinations.some(suggested => suggested.id === place.id))
          .slice(0, needed);
        
        if (filteredPlaces.length > 0) {
          setSuggestedDestinations(prev => [...prev, ...filteredPlaces]);
        }
      }
    } catch (error) {
      // Error replenishing suggestions
    }
  };

  // Add destination
  const addDestination = (destination: PlaceItem) => {
    setSelectedDestinations(prev => [...prev, destination]);
  };

  // Remove destination
  const removeDestination = (id: string) => {
    setSelectedDestinations(prev => {
      const updated = prev.filter(d => d.id !== id);
      // Also update session storage immediately (destination-specific)
      try {
        const destinationKey = tripData.destination ? `_${tripData.destination.replace(/\s+/g, '_')}` : '';
        sessionStorage.setItem(`dest_selected_${chatId}${destinationKey}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Handle generate trip
  const handleGenerateTrip = async () => {
    const finalTripData = {
      ...tripData,
      selectedDestinations,
      startDestination,
      endDestination,
      chatId
    };

    if (onComplete) {
      onComplete(finalTripData);
    } else {
      // Save to localStorage and navigate
      localStorage.setItem(`finalTripData_${chatId}`, JSON.stringify(finalTripData));
      window.location.href = '/chat';
    }
  };

  // Load initial destinations on mount
  useEffect(() => {
    loadInitialDestinations();
  }, [tripData.destination]);

  // Calculate pins for map - show suggestions only when visible
  const allPins = showSuggestions ? [...selectedDestinations, ...suggestedDestinations] : selectedDestinations;

  // Loading component for destinations
  const LoadingSkeleton = () => (
    <div className="space-y-1 mb-2">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-2 border border-gray-200 rounded-md bg-white h-16 animate-pulse">
          <div className="flex items-center gap-2 h-full">
            <div className="w-12 h-10 bg-gray-200 rounded-md flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-4 h-4 bg-gray-200 rounded-full flex-shrink-0"></div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Loading component for suggestions
  const SuggestionsLoadingSkeleton = () => (
    <div className="space-y-1 max-h-48 overflow-y-auto">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border border-gray-200 rounded-md bg-white shadow-sm p-2 h-12 animate-pulse">
          <div className="flex items-center gap-2 h-full">
            <div className="w-8 h-6 bg-gray-200 rounded flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="w-3 h-3 bg-gray-200 rounded flex-shrink-0"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-screen bg-white font-['Inter',sans-serif] flex flex-col">
      <Sidebar />
      
      {/* Main Content - Single Card Layout */}
        <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Card className="border border-purple-200 rounded-2xl bg-white shadow-lg">
            <div className="p-4">
            {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-xl font-bold text-purple-900 mb-1">
                    Choose Trip Destinations
                  </h1>
                  <p className="text-xs text-gray-600">
                    Pick all the places where you will spend at least one night
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-purple-50 px-2 py-1 rounded-md text-xs">
                    <Users className="w-3 h-3 text-purple-600" />
                    <span className="text-purple-800 font-medium">
                      {tripData.travelers} Travelers
                    </span>
                    <ChevronDown className="w-3 h-3 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 px-2 py-1 rounded-md text-xs">
                    <Settings className="w-3 h-3 text-purple-600" />
                    <span className="text-purple-800 font-medium">
                      Trip Preferences
                    </span>
                    <Settings className="w-3 h-3 text-purple-600" />
                </div>
              </div>
            </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-5 gap-4">
                {/* Left Column - Destinations */}
                <div className="col-span-2">
            {/* Start/End Inputs */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  START
                </label>
                      <div className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 text-xs text-center bg-white">
                  {startDestination}
                </div>
              </div>
              <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  END
                </label>
                      <div className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 text-xs text-center bg-white">
                  {endDestination}
                </div>
              </div>
            </div>

            {/* Chosen Destinations */}
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Chosen Destinations ({selectedDestinations.length})
                </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      Chosen by Travion.ai based on the conversation. You can Add to, Remove from, or Reorder this list.
                    </p>

                    {initialLoading ? (
                      <LoadingSkeleton />
                    ) : (
                      <div className="space-y-1 mb-2">
                {selectedDestinations.map((destination, index) => (
                        <Card key={`selected-${destination.id}-${index}`} className="p-2 border border-gray-200 rounded-md bg-white hover:shadow-sm transition-shadow h-16">
                          <div className="flex items-center gap-2 h-full">
                      <div className="relative flex-shrink-0">
                        <img 
                                src={destination.photoUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=50&h=40&fit=crop&q=80"}
                          alt={destination.name}
                                className="w-12 h-10 rounded-md object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 text-xs line-clamp-1">
                            {destination.name}
                          </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {destination.rating && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-yellow-500 text-xs">★</span>
                                        <span className="text-xs text-gray-600">{destination.rating.toFixed(1)}</span>
                                      </div>
                                    )}
                                    {destination.priceLevel && (
                                      <span className="text-xs text-gray-500">
                                        {'$'.repeat(destination.priceLevel)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeDestination(destination.id)}
                                  className="h-4 w-4 p-0 hover:bg-gray-100 rounded-full flex-shrink-0"
                          >
                            <X className="w-3 h-3 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
                    )}

                    <div className="mb-2">
                <Button 
                  variant="outline" 
                        onClick={async () => { 
                          setShowSuggestions(true); 
                          if (suggestedDestinations.length === 0) { 
                            await loadSuggestions(10); 
                          } 
                        }}
                        disabled={loadingSuggestions}
                        className="w-full flex items-center justify-center gap-1 h-8 rounded-md border-2 border-dashed border-purple-300 hover:border-purple-400 hover:bg-purple-50 transition-colors bg-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingSuggestions ? (
                    <Loader2 className="w-3 h-3 text-purple-600 animate-spin" />
                  ) : (
                    <Plus className="w-3 h-3 text-purple-600" />
                  )}
                  {loadingSuggestions ? 'Loading suggestions...' : 'Add Another Destination'}
                </Button>
              </div>
              
              {/* Show suggestions count only when suggestions are visible */}
              {showSuggestions && (
                <p className="text-xs text-center text-purple-600 mb-2">
                  ({suggestedDestinations.length} Suggestions)
                </p>
              )}

              {/* Suggestions */}
              {showSuggestions && (
                      <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-medium text-gray-700">Suggestions for you</div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                            onClick={() => {
                              setShowSuggestions(false);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 h-6 px-2"
                      >
                        Hide
                      </Button>
                    </div>
                        {loadingSuggestions ? (
                          <SuggestionsLoadingSkeleton />
                        ) : suggestedDestinations.length > 0 ? (
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                    {suggestedDestinations.map((s, index) => (
                      <div
                        key={`suggested-${s.id}-${index}`}
                        title={s.name}
                              className="border border-gray-200 rounded-md bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-2 h-12"
                        onMouseEnter={() => setHoveredPlace(s.id)}
                        onMouseLeave={() => setHoveredPlace(null)}
                        onClick={async () => {
                          addDestination(s);
                          setSuggestedDestinations(prev => prev.filter(p => p.id !== s.id));
                          await replenishWithSimilar(s);
                        }}
                      >
                              <div className="flex items-center gap-2 h-full">
                                <img 
                                  src={s.photoUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=32&h=24&fit=crop&q=70'} 
                                  alt={s.name} 
                                  className="w-8 h-6 object-cover rounded flex-shrink-0" 
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium line-clamp-1 text-gray-800">{s.name}</div>
                                  <div className="flex items-center gap-2">
                                    {s.rating && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-yellow-500 text-xs">★</span>
                                        <span className="text-xs text-gray-600">{s.rating.toFixed(1)}</span>
                                      </div>
                                    )}
                                    {s.priceLevel && (
                                      <span className="text-xs text-gray-500">
                                        {'$'.repeat(s.priceLevel)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Plus className="w-3 h-3 text-purple-600 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-xs">
                            No suggestions available
                          </div>
                        )}
                </div>
              )}
          </div>
        </div>

                {/* Right Column - Map */}
                <div className="col-span-3 pl-4">
                  <div className="h-[400px] w-full border border-blue-300 rounded-lg overflow-hidden ml-4">
            {initialLoading ? (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-2 animate-spin" />
                  <p className="text-xs text-gray-500">Loading destinations...</p>
                </div>
              </div>
            ) : mapsApiKey && allPins.length > 0 ? (
              <MapEmbed 
                apiKey={mapsApiKey} 
                pins={allPins} 
                className="w-full h-full" 
                onHover={setHoveredPlace}
                selectedPins={selectedDestinations.map(d => d.id)}
                        autoZoom={true}
                        smoothAnimations={true}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Select destinations to view on map</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

              {/* Bottom Section - Route Options & Generate Button */}
              <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
                  {/* Route Options */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="routeOption" 
                        value="suggest" 
                        defaultChecked
                        className="w-3 h-3 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <span className="text-xs text-gray-700">Suggest the best possible route</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="routeOption" 
                        value="manual" 
                        className="w-3 h-3 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <span className="text-xs text-gray-700">I'll choose the order</span>
                    </label>
          </div>
          
                  {/* Generate Trip Button */}
                  <Button 
                    onClick={handleGenerateTrip}
                    disabled={initialLoading || selectedDestinations.length === 0}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {initialLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Generate Trip with ${selectedDestinations.length} Destinations`
                    )}
            </Button>
          </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center justify-start mt-2 gap-3">
                  <button className="p-1 hover:bg-gray-100 rounded-lg">
                    <ThumbsUp className="w-3 h-3 text-gray-500" />
            </button>
                  <button className="p-1 hover:bg-gray-100 rounded-lg">
                    <ThumbsDown className="w-3 h-3 text-gray-500" />
            </button>
                  <button className="p-1 hover:bg-gray-100 rounded-lg">
                    <RotateCcw className="w-3 h-3 text-gray-500" />
            </button>
                  <span className="text-xs text-gray-500">Undo</span>
        </div>
      </div>
            </div>
          </Card>
        </div>
          </div>
          
    </div>
  );
};

export default Destinations;