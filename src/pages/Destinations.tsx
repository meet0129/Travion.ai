import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, X, Plus, Users, Settings } from "lucide-react";
import { useState } from "react";

const Destinations = () => {
  const [startDestination, setStartDestination] = useState("Ahmedabad");
  const [endDestination, setEndDestination] = useState("Ahmedabad");
  const [travelers, setTravelers] = useState(5);

  const selectedDestinations = [
    {
      id: "manali",
      name: "Manali, Himachal Pradesh, India", 
      description: "Includes day trips to: Rohtang Pass + 1 more",
      image: "/api/placeholder/150/100"
    },
    {
      id: "kasol", 
      name: "Kasol, Himachal Pradesh, India",
      description: "Includes day trips to: Manikaran",
      image: "/api/placeholder/150/100"
    },
    {
      id: "kullu",
      name: "Kullu, Himachal Pradesh, India", 
      description: "Highlights include: Raghunath Temple...",
      image: "/api/placeholder/150/100"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <div className="w-16 bg-background border-r border-border flex flex-col items-center py-4 space-y-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
          <span className="text-white text-sm">T</span>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">👤</span>
        </div>
        <div className="flex-1" />
        <div className="space-y-2">
          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
            <span className="text-xs">ℹ️</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Destination Selection */}
        <div className="w-1/2 p-6 border-r border-border">
          <div className="bg-card border border-border rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-card-foreground">Choose Trip Destinations</h2>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {travelers} Travelers
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  Trip Preferences
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">
              Pick all the places where you will spend at least one night
            </p>

            {/* Start/End Inputs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">START</label>
                <Input 
                  value={startDestination}
                  onChange={(e) => setStartDestination(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">END</label>
                <Input 
                  value={endDestination}
                  onChange={(e) => setEndDestination(e.target.value)}
                  className="rounded-lg"
                />
              </div>
            </div>

            {/* Selected Destinations */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-card-foreground">
                  Chosen Destinations ({selectedDestinations.length})
                </h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Chosen by Travion based on the conversation.<br />
                You can Add to, Remove from, or Reorder this list
              </p>

              <div className="space-y-3">
                {selectedDestinations.map((destination) => (
                  <Card key={destination.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={destination.image}
                        alt={destination.name}
                        className="w-16 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-card-foreground">{destination.name}</h4>
                        <p className="text-sm text-muted-foreground">{destination.description}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add Another Destination
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-2">
                (3 Suggestions)
              </p>
            </div>

            {/* Route Options */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  id="suggested-route"
                  name="route"
                  defaultChecked
                  className="w-4 h-4 text-primary"
                />
                <label htmlFor="suggested-route" className="text-sm text-card-foreground">
                  Suggest the best possible route
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  id="chosen-order"
                  name="route"
                  className="w-4 h-4 text-primary"
                />
                <label htmlFor="chosen-order" className="text-sm text-card-foreground">
                  I'll choose the order
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <Button 
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground rounded-full py-3 text-lg font-medium"
              size="lg"
            >
              Generate Trip with {selectedDestinations.length} Destinations
            </Button>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="w-1/2 p-6">
          <div className="w-full h-full bg-muted rounded-2xl relative overflow-hidden">
            {/* Placeholder for Google Maps */}
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🗺️</span>
                </div>
                <p className="text-lg font-medium text-green-800">Google Maps Integration</p>
                <p className="text-sm text-green-600">Interactive map will show selected destinations</p>
              </div>
            </div>
            
            {/* Map Controls */}
            <div className="absolute top-4 right-4">
              <div className="bg-white rounded-lg shadow-lg p-2 space-y-2">
                <Button variant="ghost" size="sm">+</Button>
                <Button variant="ghost" size="sm">-</Button>
              </div>
            </div>
            
            {/* Map Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Keyboard shortcuts</span>
                <span>Map data ©2023</span>
                <span>Terms</span>
                <span>Report a map error</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Input */}
      <div className="fixed bottom-6 left-20 right-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 bg-card border border-border rounded-full px-6 py-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-xs">T</span>
            </div>
            <input 
              type="text" 
              placeholder="Ask Travion..."
              className="flex-1 bg-transparent border-none outline-none text-card-foreground"
            />
            <ChevronRight className="w-5 h-5 text-muted-foreground cursor-pointer" />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Travion is in beta and can make mistakes. Please check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Destinations;