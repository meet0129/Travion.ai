import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, X, Plus, Users, Settings, MapPin, Calendar, Clock, Star, Heart, Navigation } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

const Destinations = () => {
  const navigate = useNavigate();
  
  // Get trip data from localStorage
  const [tripData, setTripData] = useState({
    destination: 'Manali',
    from: 'Ahmedabad',
    duration: '5 days',
    travelTime: 'October',
    travelers: 1,
    preferences: []
  });

  const [startDestination, setStartDestination] = useState("Ahmedabad");
  const [endDestination, setEndDestination] = useState("Ahmedabad");
  const [inputValue, setInputValue] = useState("");

  // Chat messages for this page
  const [messages, setMessages] = useState([
    {
      type: "ai",
      content: "Perfect! Based on your preferences and trip details, I've curated the ideal destinations for your journey. Let's finalize your itinerary!",
      timestamp: new Date()
    }
  ]);

  useEffect(() => {
    // Load trip data from localStorage
    const savedTripData = localStorage.getItem('tripData');
    if (savedTripData) {
      const parsedData = JSON.parse(savedTripData);
      setTripData(parsedData);
      setStartDestination(parsedData.from || 'Ahmedabad');
      setEndDestination(parsedData.from || 'Ahmedabad');
    }
  }, []);

  const selectedDestinations = [
    {
      id: "manali",
      name: `${tripData.destination}, Himachal Pradesh, India`, 
      description: `Includes day trips to: ${tripData.preferences.length > 0 ? 'Your selected experiences' : 'Solang Valley'} + 1...`,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=60&fit=crop&q=80",
      rating: 4.8,
      duration: "3 days",
      highlights: ["Snow-capped peaks", "Adventure sports", "Hot springs"]
    },
    {
      id: "kullu",
      name: "Kullu, Himachal Pradesh, India", 
      description: "Highlights include: Raghunath Temple, Valley views...",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=60&fit=crop&q=80",
      rating: 4.4,
      duration: "2 days",
      highlights: ["Temples", "Valley views", "Local culture"]
    }
  ];

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages(prev => [...prev, {
        type: "user",
        content: inputValue,
        timestamp: new Date()
      }]);
      
      // Simple AI response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: "ai",
          content: "I understand! I'll make sure to incorporate your feedback into the itinerary. Feel free to make any adjustments to your destination list.",
          timestamp: new Date()
        }]);
      }, 1000);
      
      setInputValue("");
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
    
    // Add success message
    setMessages(prev => [...prev, {
      type: "ai",
      content: "🎉 Perfect! I'm now generating your complete personalized itinerary with flights, hotels, and day-by-day plans. This includes all your selected destinations and preferences. Your dream vacation is ready!",
      timestamp: new Date()
    }]);
    
    // Navigate back to chat to show the final itinerary
    setTimeout(() => {
      navigate("/chat");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-4xl mx-auto px-4 pt-6">
        <Sidebar />
        
        {/* Chat Messages */}
        <div className="space-y-6 mb-8">
          {messages.map((message, index) => (
            <div key={index}>
              {message.type === 'ai' ? (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">A</span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Airial</span>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                      <p className="text-slate-900 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">U</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3 max-w-xs">
                      <p className="text-slate-900 dark:text-slate-100 text-sm font-medium">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Destinations Selection Card */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-purple-200 dark:border-purple-800 rounded-3xl p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Choose Trip Destinations
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Pick all the places where you will spend at least one night
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full border-slate-300">
                  <Users className="w-4 h-4" />
                  {tripData.travelers} Travelers
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full border-slate-300">
                  Trip Preferences
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Trip Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-4 mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Your Trip Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Destination:</span>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{tripData.destination}</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Duration:</span>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{tripData.duration}</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">When:</span>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{tripData.travelTime}</div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Preferences:</span>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{tripData.preferences.length} selected</div>
                </div>
              </div>
            </div>

            {/* Start/End Location Inputs */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  START
                </label>
                <div className="relative">
                  <Input 
                    value={startDestination}
                    onChange={(e) => setStartDestination(e.target.value)}
                    className="rounded-full h-10 bg-slate-100 dark:bg-slate-700 border-0 pl-4 pr-4 text-sm font-medium"
                    placeholder="Enter starting city"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  END
                </label>
                <div className="relative">
                  <Input 
                    value={endDestination}
                    onChange={(e) => setEndDestination(e.target.value)}
                    className="rounded-full h-10 bg-slate-100 dark:bg-slate-700 border-0 pl-4 pr-4 text-sm font-medium"
                    placeholder="Enter ending city"
                  />
                </div>
              </div>
            </div>

            {/* Selected Destinations */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Chosen Destinations ({selectedDestinations.length})
                </h3>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Chosen by Airial based on your conversation and selected preferences.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                You can <span className="text-blue-600 cursor-pointer">Add to</span>, <span className="text-blue-600 cursor-pointer">Remove from</span>, or <span className="text-blue-600 cursor-pointer">Reorder</span> this list
              </p>

              <div className="space-y-3">
                {selectedDestinations.map((destination, index) => (
                  <Card key={destination.id} className="p-4 hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700 rounded-2xl group bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={destination.image}
                          alt={destination.name}
                          className="w-20 h-16 rounded-xl object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                            {destination.name}
                          </h4>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                            <X className="w-4 h-4 text-slate-500" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                          {destination.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{destination.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{destination.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4 flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                <Plus className="w-5 h-5 text-purple-600" />
                Add Another Destination
              </Button>
              
              <p className="text-sm text-center text-purple-600 dark:text-purple-400 mt-2">
                (8 Suggestions available)
              </p>
            </div>

            {/* Route Options */}
            <div className="space-y-4 mb-8">
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="route"
                    defaultChecked
                    className="w-5 h-5 text-purple-500 mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">Suggest the best possible route</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="route"
                    className="w-5 h-5 text-purple-500 mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">I'll choose the order</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerateTrip}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              Generate Trip with {selectedDestinations.length} Destinations
            </Button>
          </div>
        </div>

        {/* Enhanced Chat Input */}
        <div className="sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 pt-4">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Ask Airial ..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    <ArrowRight className="w-5 h-5 text-slate-500 dark:text-slate-400 cursor-pointer hover:text-purple-500 transition-colors" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="w-8 h-8 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Destinations;