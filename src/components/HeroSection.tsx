import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [tripDescription, setTripDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (tripDescription.trim()) {
      // Navigate to chat interface
      navigate("/chat");
    }
  };

  const handlePlanTrip = () => {
    navigate("/chat");
  };

  const handleAskTravion = () => {
    navigate("/chat");
  };

  return (
    <div className="relative flex flex-col items-center justify-center px-4 py-8 lg:py-16 max-w-4xl mx-auto">
      {/* Background Graphics */}
      <div className="absolute inset-0 opacity-5 bg-[url('/src/assets/travel-background.svg')] bg-cover bg-center -z-10" />
      
      {/* Brand and Tagline */}
      <div className="text-center mb-6 lg:mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-primary flex items-center justify-center hover:scale-110 transition-transform duration-300 touch-manipulation">
            <span className="text-xl lg:text-2xl">✈️</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-foreground">Travion</span>
            <span className="px-2 py-1 text-xs lg:text-sm bg-primary/10 text-primary rounded-full border border-primary/20 animate-pulse">
              BETA
            </span>
          </div>
        </div>
        <p className="text-base lg:text-lg text-muted-foreground max-w-md px-4">
          Your personal travel agent with AI superpowers
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 lg:gap-4 mb-6 lg:mb-8 animate-scale-in w-full max-w-md sm:max-w-none">
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary-dark text-primary-foreground px-6 lg:px-8 py-3 rounded-full font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 w-full sm:w-auto touch-manipulation"
          onClick={handlePlanTrip}
        >
          Plan a Trip
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          className="px-6 lg:px-8 py-3 rounded-full font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg w-full sm:w-auto touch-manipulation"
          onClick={handleAskTravion}
        >
          Ask Travion
        </Button>
      </div>

      {/* Trip Input */}
      <div className="w-full max-w-2xl mb-6 lg:mb-8 animate-fade-in">
        <div className="relative">
          <Input
            placeholder="Simply describe your trip..."
            value={tripDescription}
            onChange={(e) => setTripDescription(e.target.value)}
            className="w-full px-4 lg:px-6 py-4 text-base lg:text-lg rounded-2xl border-2 border-border focus:border-primary pr-24 lg:pr-20 transition-all duration-300 focus:shadow-lg focus:shadow-primary/10 hover:shadow-md h-14 lg:h-auto"
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button
            onClick={handleSubmit}
            size="sm" 
            disabled={!tripDescription.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl px-4 lg:px-6 py-2 font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-purple-500/25 touch-manipulation text-sm lg:text-base"
          >
            <span className="hidden sm:inline">Submit</span>
            <ArrowRight className="w-4 h-4 sm:ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;