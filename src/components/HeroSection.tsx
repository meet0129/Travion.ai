import { Button } from "@/components/ui/button";
import logo from "@/assets/travion_logo2.0.png";
import { ArrowRight, ChevronDown, MapPin, Calendar, Users, Star } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "@/components/Sidebar";
import PopularTrips from "./PopularTrips";

const HeroSection = () => {
  const [tripDescription, setTripDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (tripDescription.trim()) {
      const newChatId = uuidv4();
      localStorage.setItem('initialTripDescription', tripDescription);
      navigate(`/chat/${newChatId}`);
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
    const newChatId = uuidv4();
    localStorage.setItem('initialTripDescription', tripQuery);
    navigate(`/chat/${newChatId}`);
  };

  return (
    <div className="flex min-h-screen ">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area with full gradient background */}
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
        <div className="flex items-center justify-center min-h-screen px-6 py-6">
          <div className="w-full max-w-4xl space-y-8 text-center">
            {/* Logo and Title Section */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-1 mb-1">
                <img src={logo} alt="Travion logo" className="w-14 h-14 rounded-lg object-contain" />
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                <span className="text-4xl font-bold ">Travion<span className="font-normal">.ai</span></span>
                </h1>
              </div>
              <h3 className="text-l text-slate-800 dark:text-slate-200 font-semibold mb-1">
                Smart Travel Planning
              </h3>
              <h4 className="text-lg text-slate-600 dark:text-slate-400 font-normal mb-2">
                From dream destinations to detailed itineraries
              </h4>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
                onClick={() => navigate(`/chat/${uuidv4()}`)}
              >
                Plan a Trip
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-3 rounded-full font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                onClick={() => navigate(`/chat/${uuidv4()}`)}
              >
                Ask Travion
              </Button>
            </div>

            {/* Main Chat Input */}
            <div className="max-w-3xl mx-auto">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-blue-300 via-fuchsia-300 to-purple-300 shadow-[0_10px_30px_rgba(149,76,233,0.25)]">
                  <div className="relative rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-lg">
                    <div className="flex items-end gap-3 p-4">
                      <textarea
                        rows={2}
                        placeholder="Simply describe your trip ..."
                        value={tripDescription}
                        onChange={(e) => setTripDescription(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none h-16 max-h-40 overflow-auto text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                      <button
                        type="submit"
                        disabled={!tripDescription.trim()}
                        className={`group inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                          !tripDescription.trim()
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-200/80 hover:bg-slate-300 text-slate-600 dark:bg-slate-700/70 dark:text-slate-200 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => tripDescription.trim() && handleSubmit()}
                      >
                        Submit
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
                          <path d="M9.62 3.95334L13.6667 8.00001L9.62 12.0467" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M2.33334 8H13.5533" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                      </button>
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