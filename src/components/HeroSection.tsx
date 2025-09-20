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
          <div className="w-full max-w-4xl space-y-8 text-center">
            {/* Logo and Title Section */}
            <div className="space-y-4 mb-12">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">✈</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  <span className="text-purple-600">Travion.ai</span>
                </h1>
              </div>
              <h3 className="text-2xl text-slate-800 dark:text-slate-200 font-semibold mb-2">
                Smart Travel Planning
              </h3>
              <h4 className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                From dream destinations to detailed itineraries
              </h4>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
                onClick={() => navigate("/chat")}
              >
                Plan a Trip
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-3 rounded-full font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                onClick={() => navigate("/preferences")}
              >
                Ask Travion
              </Button>
            </div>

            {/* Main Chat Input */}
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-w-3xl mx-auto p-4">
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="relative">
                  <textarea
                    rows={2}
                    placeholder="Simply describe your trip ..."
                    value={tripDescription}
                    onChange={(e) => setTripDescription(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="rounded-lg w-full resize-none overflow-y-auto focus:outline-transparent bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base p-0"
                    style={{ height: '48px', width: '100%' }}
                  />
                </div>
                
                <div className="flex text-sm items-center justify-end gap-4">
                  <div 
                    role="presentation" 
                    className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg transition-colors ${
                      !tripDescription.trim() 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                    onClick={() => tripDescription.trim() && handleSubmit()}
                  >
                    <div className={`text-sm font-medium ${
                      !tripDescription.trim() 
                        ? 'text-slate-400' 
                        : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      Submit
                    </div>
                    <div className={`${
                      !tripDescription.trim() 
                        ? 'text-slate-400' 
                        : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M9.62 3.95334L13.6667 8.00001L9.62 12.0467" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M2.33334 8H13.5533" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <PopularTrips />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;