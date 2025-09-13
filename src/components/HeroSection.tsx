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
    <div className="relative flex flex-col items-center justify-center px-4 py-16 max-w-4xl mx-auto">
      {/* Background Graphics */}
      <div className="absolute inset-0 opacity-5 bg-[url('/src/assets/travel-background.svg')] bg-cover bg-center -z-10" />
      
      {/* Brand and Tagline */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center hover:scale-110 transition-transform duration-300">
            <span className="text-2xl">✈️</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-foreground">Travion</span>
            <span className="px-2 py-1 text-sm bg-primary/10 text-primary rounded-full border border-primary/20 animate-pulse">
              BETA
            </span>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-md">
          Your personal travel agent with AI superpowers
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-8 animate-scale-in">
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary-dark text-primary-foreground px-8 py-3 rounded-full font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
          onClick={handlePlanTrip}
        >
          Plan a Trip
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          className="px-8 py-3 rounded-full font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg"
          onClick={handleAskTravion}
        >
          Ask Travion
        </Button>
      </div>

      {/* Trip Input */}
      <div className="w-full max-w-2xl mb-8 animate-fade-in">
        <div className="relative">
          <Input
            placeholder="Simply describe your trip..."
            value={tripDescription}
            onChange={(e) => setTripDescription(e.target.value)}
            className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-border focus:border-primary pr-16 transition-all duration-300 focus:shadow-lg focus:shadow-primary/10"
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button
            onClick={handleSubmit}
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl px-4 hover:scale-105 transition-all duration-200"
          >
            Submit
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;