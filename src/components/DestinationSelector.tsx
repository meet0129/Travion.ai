import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Plus, Users, Settings, MapPin, ChevronDown } from "lucide-react";
import {
  fetchAllCategoriesForDestination,
  PlaceItem,
  similarPlacesByPlace,
} from "@/database/googlePlaces";
import MapEmbed from "@/components/MapEmbed";

interface DestinationSelectorProps {
  tripData: {
    destination: string;
    from: string;
    duration: string;
    travelTime: string;
    travelers: number;
    preferences: any[];
  };
  onComplete: (destinations: PlaceItem[]) => void;
  className?: string;
}

export default function DestinationSelector({
  tripData,
  onComplete,
  className = "",
}: DestinationSelectorProps) {
  const [startDestination, setStartDestination] = useState(
    tripData.from || "Ahmedabad"
  );
  const [endDestination, setEndDestination] = useState(
    tripData.from || "Ahmedabad"
  );
  const [selectedDestinations, setSelectedDestinations] = useState<PlaceItem[]>(
    []
  );
  const [suggestedDestinations, setSuggestedDestinations] = useState<
    PlaceItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  useEffect(() => {
    loadInitialDestinations();
  }, [tripData]);

  const loadInitialDestinations = async () => {
    if (!apiKey) return;

    setLoading(true);
    try {
      // If user has preferences, use those places as destinations
      if (tripData.preferences && tripData.preferences.length > 0) {
        // Convert preferences to destinations
        const destinations = tripData.preferences.map((pref: PlaceItem) => ({
          ...pref,
          duration: "2-3 days",
          highlights: ["Adventure", "Scenic views", "Local culture"],
        }));
        setSelectedDestinations(destinations.slice(0, 2)); // Limit to 2 main destinations
      } else {
        // Default destinations if no preferences
        const defaultDestinations = [
          {
            id: "manali",
            name: "Manali, Himachal Pradesh, India",
            address: "Manali, Himachal Pradesh, India",
            rating: 4.8,
            userRatingsTotal: 15000,
            photoUrl:
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=60&fit=crop&q=80",
            location: { lat: 32.2432, lng: 77.1892 },
            duration: "3 days",
            highlights: [
              "Snow-capped peaks",
              "Adventure sports",
              "Hot springs",
            ],
          },
        ];
        setSelectedDestinations(defaultDestinations);
      }

      // Load suggested destinations
      const suggestions = await fetchAllCategoriesForDestination(
        tripData.destination,
        apiKey,
        8
      );
      const allSuggestions = [
        ...suggestions.attractions,
        ...suggestions.day_trips,
        ...suggestions.hidden_gems,
      ].slice(0, 8);
      setSuggestedDestinations(allSuggestions);
    } catch (error) {
      console.error("Failed to load destinations:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeDestination = (id: string) => {
    setSelectedDestinations((prev) => prev.filter((dest) => dest.id !== id));
  };

  const addDestination = (destination: PlaceItem) => {
    if (!selectedDestinations.find((dest) => dest.id === destination.id)) {
      setSelectedDestinations((prev) => [...prev, destination]);
    }
  };

  const pins = useMemo(
    () =>
      selectedDestinations.map((d) => ({
        id: d.id,
        name: d.name,
        location: d.location,
      })),
    [selectedDestinations]
  );

  const loadSuggestions = async (count: number) => {
    if (!apiKey) return;
    const suggestions = await fetchAllCategoriesForDestination(
      tripData.destination,
      apiKey,
      Math.max(count, 6)
    );
    const pool = [
      ...suggestions.attractions,
      ...suggestions.day_trips,
      ...suggestions.hidden_gems,
      ...suggestions.food_cafes,
    ];
    // Dedup and exclude already selected
    const selectedIds = new Set(selectedDestinations.map((d) => d.id));
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
    const existing = new Set<string>(
      [...selectedDestinations, ...suggestedDestinations].map((p) => p.id)
    );
    const next: PlaceItem[] = [];
    for (const p of similar) {
      if (!existing.has(p.id)) next.push(p);
      if (next.length >= need) break;
    }
    setSuggestedDestinations((prev) => [...prev, ...next].slice(0, 10));
  };

  const handleGenerateTrip = () => {
    onComplete(selectedDestinations);
  };

  return (
    <div
      className={`animate-in slide-in-from-right duration-500 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden ${className}`}
    >
      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1fr] gap-5 p-5">
        {/* Left Side - Destinations */}
        <div
          className="space-y-6 overflow-y-auto pr-2"
          style={{ maxHeight: "500px" }}
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Choose Trip Destinations
              </h1>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 rounded-full"
                >
                  <Users className="w-4 h-4" />
                  {tripData.travelers} Travelers
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 rounded-full"
                >
                  Trip Preferences
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Pick all the places where you will spend at least one night
            </p>
          </div>

          {/* Start/End Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                START
              </label>
              <Input
                value={startDestination}
                onChange={(e) => setStartDestination(e.target.value)}
                className="rounded-lg h-10"
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
                className="rounded-lg h-10"
                placeholder="Enter ending city"
              />
            </div>
          </div>

          {/* Chosen Destinations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Chosen Destinations ({selectedDestinations.length})
              </h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              Chosen by AI based on your preferences.
            </p>

            <div className="space-y-3">
              {selectedDestinations.map((destination, index) => (
                <Card key={destination.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          destination.photoUrl ||
                          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=60&fit=crop&q=80"
                        }
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
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {index === 0
                          ? "Includes day trips to nearby attractions"
                          : "Includes local sightseeing"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={async () => {
                setShowSuggestions(true);
                if (suggestedDestinations.length === 0) {
                  await loadSuggestions(5);
                }
              }}
              className="w-full mt-4 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Another Destination
            </Button>

            {showSuggestions && suggestedDestinations.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-medium text-slate-500 mb-2">
                  Suggestions for you
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {suggestedDestinations.map((s) => (
                    <div
                      key={s.id}
                      title={s.name}
                      className="flex-shrink-0 w-60 border rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition cursor-pointer"
                      onClick={async () => {
                        addDestination(s);
                        setSuggestedDestinations((prev) =>
                          prev.filter((p) => p.id !== s.id)
                        );
                        await replenishWithSimilar(s);
                      }}
                    >
                      <img
                        src={s.photoUrl || "placeholder.jpg"}
                        alt={s.name}
                        className="w-60 h-28 object-cover rounded-t-lg"
                      />
                      <div className="p-2">
                        <div className="text-xs font-semibold line-clamp-1">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {s.address}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="space-y-6">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="h-[400px]">
              {apiKey && pins.length > 0 ? (
                <MapEmbed
                  apiKey={apiKey}
                  pins={pins}
                  className="w-full h-full"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-700">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                      Select destinations to view on map
                    </p>
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
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
        >
          Generate Trip with {selectedDestinations.length} Destinations
        </Button>
      </div>
    </div>
  );
}
