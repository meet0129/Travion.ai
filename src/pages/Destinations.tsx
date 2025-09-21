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
  RotateCcw 
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hoveredPlace, setHoveredPlace] = useState<string | null>(null);
  const [showOnlySelected, setShowOnlySelected] = useState(false);

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
      }
    }
  }, [propTripData, chatId]);

  // Load initial destinations based on preferences
  const loadInitialDestinations = async () => {
    if (!apiKey || !tripData.destination) return;
    
    setLoading(true);
    try {
      const selectedPreferences = JSON.parse(localStorage.getItem('selectedPreferences') || '[]');
      console.log('Loading initial destinations with preferences:', selectedPreferences);
      
      const allPlacesData = await fetchAllCategoriesForDestination(tripData.destination, apiKey);
      console.log('All places data:', allPlacesData);
      
      // Filter and flatten places based on selected preferences
      const filteredPlaces = Object.entries(allPlacesData)
        .filter(([category, places]) => selectedPreferences.includes(category))
        .flatMap(([category, places]) => places)
        .filter(place => place.name && place.address && place.rating >= 4.0 && place.photoUrl)
        .slice(0, 3); // Take top 3 places
      
      setSelectedDestinations(filteredPlaces);
      console.log('Selected destinations:', filteredPlaces);
    } catch (error) {
      console.error('Error loading initial destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load suggestions
  const loadSuggestions = async (limit: number = 7) => {
    if (!apiKey || !tripData.destination) return;
    
    setLoading(true);
    try {
      const allPlacesData = await fetchAllCategoriesForDestination(tripData.destination, apiKey);
      const allPlaces = Object.values(allPlacesData).flat();
      const filteredPlaces = allPlaces
        .filter(place => place.name && place.address && place.rating >= 4.0 && place.photoUrl)
        .filter(place => !selectedDestinations.some(selected => selected.id === place.id))
        .slice(0, limit);
      
      setSuggestedDestinations(filteredPlaces);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load nearby places
  const loadNearbyPlaces = async () => {
    if (!apiKey) return;
    const need = Math.max(0, 7 - suggestedDestinations.length);
    if (need === 0) return;

    setLoading(true);
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
      setLoading(false);
    }
  };

  // Replenish with similar places
  const replenishWithSimilar = async (addedPlace: PlaceItem) => {
    if (!apiKey) return;
    try {
      const similarPlaces = await similarPlacesByPlace(addedPlace, apiKey, 1);
      if (similarPlaces.length > 0) {
        setSuggestedDestinations(prev => [...prev, similarPlaces[0]]);
      }
    } catch (error) {
      console.error('Error replenishing suggestions:', error);
    }
  };

  // Add destination
  const addDestination = (destination: PlaceItem) => {
    setSelectedDestinations(prev => [...prev, destination]);
    // Update map immediately
    const updatedPins = [...selectedDestinations, destination];
    console.log('Updated pins after adding:', updatedPins);
  };

  // Remove destination
  const removeDestination = (id: string) => {
    setSelectedDestinations(prev => prev.filter(d => d.id !== id));
    // Update map immediately
    const updatedPins = selectedDestinations.filter(d => d.id !== id);
    console.log('Updated pins after removing:', updatedPins);
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

  // Calculate pins for map
  const allPins = showOnlySelected ? selectedDestinations : [...selectedDestinations, ...suggestedDestinations];

  return (
    <div className="h-screen bg-white font-['Inter',sans-serif] flex flex-col">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Destinations */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Destination Component Box */}
          <div className="border border-purple-300 rounded-lg p-4 bg-purple-50/20 h-full">
            {/* Header */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">
                You can confirm these destinations or make changes before I create your detailed itinerary.
              </p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-lg font-bold text-purple-900 mb-1">
                    Choose Trip Destinations
                  </h1>
                  <p className="text-sm text-gray-600">
                    Pick all the places where you will spend at least one night
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded text-xs">
                    <Users className="w-3 h-3 text-purple-600" />
                    <span className="text-purple-800">
                      {tripData.travelers} Travelers
                    </span>
                    <ChevronDown className="w-3 h-3 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded text-xs">
                    <Settings className="w-3 h-3 text-purple-600" />
                    <span className="text-purple-800">
                      Trip Preferences
                    </span>
                    <ChevronDown className="w-3 h-3 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Start/End Inputs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  START
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-blue-800 text-sm">
                  {startDestination}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  END
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-blue-800 text-sm">
                  {endDestination}
                </div>
              </div>
            </div>

            {/* Chosen Destinations */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">
                  Chosen Destinations ({selectedDestinations.length})
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                Chosen by Airial based on the conversation. You can <span className="text-blue-600 cursor-pointer">Add to</span>, <span className="text-blue-600 cursor-pointer">Remove from</span>, or <span className="text-blue-600 cursor-pointer">Reorder</span> this list.
              </p>

              <div className="space-y-2 mb-3">
                {selectedDestinations.map((destination, index) => (
                  <Card key={destination.id} className="p-3 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={destination.photoUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&h=45&fit=crop&q=80"}
                          alt={destination.name}
                          className="w-15 h-11 rounded-lg object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {destination.name}
                          </h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeDestination(destination.id)}
                            className="h-5 w-5 p-0 hover:bg-gray-100 rounded-full"
                          >
                            <X className="w-3 h-3 text-gray-500" />
                          </Button>
                        </div>
                        
                        <p className="text-xs text-gray-500">
                          {index === 0 ? "Includes day trips to Rohtang Pass + 1..." : 
                           index === 1 ? "Includes day trip to Kasol" : 
                           "Highlights include Mall Road and more"}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <Button 
                  variant="outline" 
                  onClick={async () => { setShowSuggestions(true); if (suggestedDestinations.length === 0) { await loadSuggestions(7); } }}
                  className="flex-1 flex items-center justify-center gap-2 h-8 rounded-lg border-2 border-dashed border-purple-300 hover:border-purple-400 hover:bg-purple-50 transition-colors bg-white text-xs"
                >
                  <Plus className="w-3 h-3 text-purple-600" />
                  Add Another Destination
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={loadNearbyPlaces}
                  className="flex items-center gap-2 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors bg-white text-xs"
                >
                  <MapPin className="w-3 h-3" />
                  Nearby Places
                </Button>
              </div>
              
              <p className="text-xs text-center text-purple-600 mb-2">
                ({suggestedDestinations.length} Suggestions)
              </p>

              {/* Suggestions */}
              {showSuggestions && suggestedDestinations.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-500">Suggestions for you</div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowOnlySelected(!showOnlySelected)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        {showOnlySelected ? 'Show All' : 'Hide from Map'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowSuggestions(false)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Hide
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {suggestedDestinations.map((s) => (
                      <div
                        key={s.id}
                        title={s.name}
                        className="flex-shrink-0 w-48 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition cursor-pointer"
                        onMouseEnter={() => setHoveredPlace(s.id)}
                        onMouseLeave={() => setHoveredPlace(null)}
                        onClick={async () => {
                          addDestination(s);
                          setSuggestedDestinations(prev => prev.filter(p => p.id !== s.id));
                          await replenishWithSimilar(s);
                        }}
                      >
                        <img src={s.photoUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=120&fit=crop&q=70'} alt={s.name} className="w-48 h-20 object-cover rounded-t-lg" />
                        <div className="p-2">
                          <div className="text-xs font-semibold line-clamp-1 text-gray-800">{s.name}</div>
                          <div className="text-[10px] text-gray-500 line-clamp-1">{s.address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preferences Component */}
            <PreferencesFolded 
              preferences={tripData.preferences || []} 
              onExpand={() => console.log('Preferences expanded')}
            />

            {/* Generate Trip Button */}
            <div className="mt-4">
              <Button 
                onClick={handleGenerateTrip}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-2 rounded-lg font-medium"
              >
                Generate Trip with {selectedDestinations.length} Destinations
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="w-1/2 border-l border-gray-200">
          <div className="h-full">
            {mapsApiKey && allPins.length > 0 ? (
              <MapEmbed 
                apiKey={mapsApiKey} 
                pins={allPins} 
                className="w-full h-full" 
                onHover={setHoveredPlace}
                selectedPins={selectedDestinations.map(d => d.id)}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select destinations to view on map</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ThumbsUp className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ThumbsDown className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <RotateCcw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Ask Airial ..."
              className="w-64 rounded-lg border-gray-300"
            />
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
              →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Destinations;