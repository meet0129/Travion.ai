import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Plus, Users, Settings, MapPin, ChevronDown, Bot } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { fetchAllCategoriesForDestination, PlaceItem, similarPlacesByPlace } from "@/database/googlePlaces";
import MapEmbed from "@/components/MapEmbed";

const Destinations = () => {
  const navigate = useNavigate();
  
  // Get trip data from localStorage
  const [tripData, setTripData] = useState({
    destination: 'Manali',
    from: 'Ahmedabad',
    duration: '5 days',
    travelTime: 'October',
    travelers: 5,

    preferences: []
  });

  const [startDestination, setStartDestination] = useState("Ahmedabad");
  const [endDestination, setEndDestination] = useState("Ahmedabad");
  const [inputValue, setInputValue] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState<PlaceItem[]>([]);
  const [suggestedDestinations, setSuggestedDestinations] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  useEffect(() => {
    // Load trip data from localStorage
    const savedTripData = localStorage.getItem('tripData');
    if (savedTripData) {
      const parsedData = JSON.parse(savedTripData);
      setTripData(parsedData);
      setStartDestination(parsedData.from || 'Ahmedabad');
      setEndDestination(parsedData.from || 'Ahmedabad');
      
      // Load selected preferences if any
      const savedPreferences = localStorage.getItem('selectedPreferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        setTripData(prev => ({ ...prev, preferences }));
      }
    }
    
    // Load initial destinations based on preferences
    loadInitialDestinations();
  }, []);

  const loadInitialDestinations = async () => {
    if (!apiKey) return;
    
    setLoading(true);
    try {
      // If user has preferences, use those places as destinations
      const savedPreferences = localStorage.getItem('selectedPreferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.length > 0) {
          // Convert preferences to destinations
          const destinations = preferences.map((pref: PlaceItem) => ({
            ...pref,
            duration: "2-3 days",
            highlights: ["Adventure", "Scenic views", "Local culture"]
          }));
          setSelectedDestinations(destinations.slice(0, 2)); // Limit to 2 main destinations
        }
      } else {
        // Default destinations if no preferences
        const defaultDestinations = [
          {
            id: "manali",
            name: "Manali, Himachal Pradesh, India",
            address: "Manali, Himachal Pradesh, India",
            rating: 4.8,
            userRatingsTotal: 15000,
            photoUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=60&fit=crop&q=80",
            location: { lat: 32.2432, lng: 77.1892 },
            duration: "3 days",
            highlights: ["Snow-capped peaks", "Adventure sports", "Hot springs"]
          },
          {
            id: "kullu",
            name: "Kullu, Himachal Pradesh, India",
            address: "Kullu, Himachal Pradesh, India", 
            rating: 4.4,
            userRatingsTotal: 8500,
            photoUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=60&fit=crop&q=80",
            location: { lat: 31.9574, lng: 77.1089 },
            duration: "2 days",
            highlights: ["Temples", "Valley views", "Local culture"]
          }
        ];
        setSelectedDestinations(defaultDestinations);
      }
      
      // Load suggested destinations
      const suggestions = await fetchAllCategoriesForDestination(tripData.destination, apiKey, 8);
      const allSuggestions = [
        ...suggestions.attractions,
        ...suggestions.day_trips,
        ...suggestions.hidden_gems
      ].slice(0, 8);
      setSuggestedDestinations(allSuggestions);
    } catch (error) {
      console.error('Failed to load destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeDestination = (id: string) => {
    setSelectedDestinations(prev => prev.filter(dest => dest.id !== id));
  };

  const addDestination = (destination: PlaceItem) => {
    if (!selectedDestinations.find(dest => dest.id === destination.id)) {
      setSelectedDestinations(prev => [...prev, destination]);
    }
  };

  // Pins for JS map
  const pins = useMemo(() => selectedDestinations.map(d => ({ id: d.id, name: d.name, location: d.location })), [selectedDestinations]);
  const allPins = useMemo(() => {
    const base = [...selectedDestinations, ...(showSuggestions ? suggestedDestinations : [])];
    const map = new Map<string, PlaceItem>();
    base.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
    return Array.from(map.values()).map(d => ({ id: d.id, name: d.name, location: d.location }));
  }, [selectedDestinations, suggestedDestinations, showSuggestions]);

  const loadSuggestions = async (count: number) => {
    if (!apiKey) return;
    const suggestions = await fetchAllCategoriesForDestination(tripData.destination, apiKey, Math.max(count, 6));
    const pool = [
      ...suggestions.attractions,
      ...suggestions.day_trips,
      ...suggestions.hidden_gems,
      ...suggestions.food_cafes,
    ];
    // Dedup and exclude already selected
    const selectedIds = new Set(selectedDestinations.map(d => d.id));
    const unique: PlaceItem[] = [];
    const seen = new Set<string>();
    for (const p of pool) {
      if (!selectedIds.has(p.id) && !seen.has(p.id)) {
        seen.add(p.id);
        unique.push(p);
      }
      if (unique.length >= count) break;
    }
    setSuggestedDestinations(unique);
  };

  const replenishWithSimilar = async (base: PlaceItem) => {
    if (!apiKey) return;
    const need = Math.max(0, 10 - suggestedDestinations.length);
    if (need === 0) return;
    const similar = await similarPlacesByPlace(base, apiKey, 15);
    const existing = new Set<string>([...selectedDestinations, ...suggestedDestinations].map(p => p.id));
    const next: PlaceItem[] = [];
    for (const p of similar) {
      if (!existing.has(p.id)) next.push(p);
      if (next.length >= need) break;
    }
    setSuggestedDestinations(prev => [...prev, ...next].slice(0, 10));
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Simple AI response
      setTimeout(() => {
        setInputValue("");
      }, 1000);
    }
  };

  const handleGenerateTrip = () => {
    // Save final trip data
    const finalTripData = {
      ...tripData,
      startDestination,
      endDestination,
      finalDestinations: selectedDestinations
    };
    
    localStorage.setItem('finalTripData', JSON.stringify(finalTripData));
    
    // Navigate back to chat to show the final itinerary
    setTimeout(() => {
      navigate("/chat");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-['Inter',sans-serif]">
      <div className="w-full max-w-[1040px] mx-auto px-5 pt-5 pr-7">
        <Sidebar />

        {/* Chat Messages */}
        <div className="space-y-8 mb-28">

          {/* AI Response Container - Destinations Layout */}
          <div className="flex items-start gap-3 w-full">
            <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-violet-600 dark:text-violet-300" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">Travion.ai</div>
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden w-full">
                {/* Main Content - Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.06fr,1fr] gap-5 p-5" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  {/* Left Side - Destinations */}
                  <div className="space-y-6 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 260px)' }}>
                    {/* Destinations Widget */}
                    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                      {/* Header */}
                      <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                          <h1 className="text-[22px] md:text-[26px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            Choose Trip Destinations
                          </h1>
                          <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full border-slate-300 bg-white dark:bg-slate-700">
                              <Users className="w-4 h-4" />
                              {tripData.travelers} Travelers
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full border-slate-300 bg-white dark:bg-slate-700">
                              Trip Preferences
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-[13px] md:text-sm text-slate-600 dark:text-slate-400">
                          Pick all the places where you will spend at least one night
                        </p>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Start/End Inputs */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              START
                            </label>
                            <Input 
                              value={startDestination}
                              onChange={(e) => setStartDestination(e.target.value)}
                              className="rounded-lg h-10 bg-slate-100 dark:bg-slate-700 border-0 pl-3 text-sm font-medium"
                              placeholder="Enter starting city"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              END
                            </label>
                            <Input 
                              value={endDestination}
                              onChange={(e) => setEndDestination(e.target.value)}
                              className="rounded-lg h-10 bg-slate-100 dark:bg-slate-700 border-0 pl-3 text-sm font-medium"
                              placeholder="Enter ending city"
                            />
                          </div>
                        </div>

                        {/* Chosen Destinations */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[16px] md:text-[18px] font-semibold text-slate-900 dark:text-slate-100">
                              Chosen Destinations ({selectedDestinations.length})
                            </h3>
                          </div>
                          
                          <p className="text-[13px] text-slate-600 dark:text-slate-400 mb-4">
                            Chosen by Travion based on the conversation.
                          </p>
                          <p className="text-[13px] text-slate-600 dark:text-slate-400 mb-4">
                            You can <span className="text-blue-600 cursor-pointer">Add to</span>, <span className="text-blue-600 cursor-pointer">Remove from</span>, or <span className="text-blue-600 cursor-pointer">Reorder</span> this list
                          </p>

                          <div className="space-y-3">
                            {selectedDestinations.map((destination, index) => (
                              <Card key={destination.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:shadow-sm transition-shadow">
                                <div className="flex items-center gap-4">
                                  <div className="relative flex-shrink-0">
                              <img 
                                      src={destination.photoUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=60&fit=crop&q=80"}
                                      alt={destination.name}
                                className="w-20 h-14 rounded-lg object-cover"
                                    />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-1">
                                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                        {destination.name}
                                      </h4>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => removeDestination(destination.id)}
                                        className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
                                      >
                                        <X className="w-4 h-4 text-slate-500" />
                                      </Button>
                                    </div>
                                    
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {index === 0 ? "Includes day trips to Solang Valley + 1..." : "Includes day trip to Manikaran Sahib"}
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>

                <Button 
                  variant="outline" 
                  onClick={async () => { setShowSuggestions(true); if (suggestedDestinations.length === 0) { await loadSuggestions(5); } }}
                  className="w-full mt-4 flex items-center justify-center gap-2 h-10 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors bg-white dark:bg-slate-800"
                >
                            <Plus className="w-4 h-4 text-purple-600" />
                            Add Another Destination
                          </Button>
                          
                          <p className="text-xs text-center text-purple-600 dark:text-purple-400 mt-2">
                            ({suggestedDestinations.length} Suggestions)
                          </p>

                {/* Suggestions bar */}
                {showSuggestions && suggestedDestinations.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-medium text-slate-500 mb-2">Suggestions for you</div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {suggestedDestinations.map((s) => (
                        <div
                          key={s.id}
                          title={s.name}
                          className="flex-shrink-0 w-60 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition cursor-pointer"
                          onClick={async () => {
                            addDestination(s);
                            // remove from suggestions and replenish up to 10
                            setSuggestedDestinations(prev => prev.filter(p => p.id !== s.id));
                            await replenishWithSimilar(s);
                          }}
                        >
                          <img src={s.photoUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=160&fit=crop&q=70'} alt={s.name} className="w-60 h-28 object-cover rounded-t-lg" />
                          <div className="p-2">
                            <div className="text-xs font-semibold line-clamp-1 text-slate-800 dark:text-slate-100">{s.name}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{s.address}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                        </div>

                        {/* Route Options */}
                        <div className="space-y-4 mb-6">
                          <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input 
                                type="radio" 
                                name="route"
                                defaultChecked
                                className="w-4 h-4 text-purple-500"
                              />
                              <span className="text-sm text-slate-900 dark:text-slate-100">Suggest the best possible route</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input 
                                type="radio" 
                                name="route"
                                className="w-4 h-4 text-purple-500"
                              />
                              <span className="text-sm text-slate-900 dark:text-slate-100">I'll choose the order</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Map */}
                <div className="space-y-6" >
                  <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                      <div className="h-[460px]" style={{ maxHeight: 'calc(100vh - 260px)' }}>
                  {apiKey && pins.length > 0 ? (
                    <MapEmbed apiKey={apiKey} pins={pins} className="w-full h-full" />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-700">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">Select destinations to view on map</p>
                      </div>
                    </div>
                  )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generate Trip Button - Full Width */}
                <div className="p-6 pt-0">
                  <Button 
                    onClick={handleGenerateTrip}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg h-12 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Generate Trip with {selectedDestinations.length} Destinations
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 pt-4">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-end gap-2 p-4">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-0 focus:ring-0 resize-none h-10 max-h-40 overflow-auto text-slate-900 dark:text-slate-100"
                style={{ height: "40px" }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                Send
              </button>
            </div>
          </div>  
        </div>
      </div>    
    </div>
  );
};

export default Destinations;