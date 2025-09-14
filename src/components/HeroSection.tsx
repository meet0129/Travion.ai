import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, MapPin, Calendar, Users, Star } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import PopularTrips from "./PopularTrips";

const HeroSection = () => {
  const [tripDescription, setTripDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (tripDescription.trim()) {
      localStorage.setItem('initialTripDescription', tripDescription);
      navigate("/chat");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTripSelect = (trip) => {
    const tripQuery = `Plan a ${trip.duration} trip to ${trip.title.split(' ')[0]} from Ahmedabad`;
    localStorage.setItem('initialTripDescription', tripQuery);
    navigate("/chat");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area with full gradient background */}
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className="w-full max-w-4xl space-y-8">
            {/* Main Chat Input */}
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">A</span>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <input 
                    type="text" 
                    placeholder="Simply describe your trip..."
                    value={tripDescription}
                    onChange={(e) => setTripDescription(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-base py-2"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={handleSubmit}
                      disabled={!tripDescription.trim()}
                      className="w-8 h-8 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 w-full sm:w-auto"
                onClick={() => navigate("/chat")}
              >
                Start Planning Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-3 rounded-full font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg border-slate-300 dark:border-slate-600 w-full sm:w-auto"
                onClick={() => navigate("/preferences")}
              >
                Explore Preferences
              </Button>
            </div>
            <PopularTrips />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;