import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Instagram } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center px-4 py-16 max-w-4xl mx-auto">
      {/* Brand and Tagline */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <span className="text-2xl">✈️</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-foreground">Travion</span>
            <span className="px-2 py-1 text-sm bg-primary/10 text-primary rounded-full border border-primary/20">
              BETA
            </span>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-md">
          Your personal travel agent with AI superpowers
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary-dark text-primary-foreground px-8 py-3 rounded-full font-medium"
          onClick={handlePlanTrip}
        >
          Plan a Trip
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          className="px-8 py-3 rounded-full font-medium"
          onClick={handleAskTravion}
        >
          Ask Travion
        </Button>
      </div>

      {/* Trip Input */}
      <div className="w-full max-w-2xl mb-8">
        <div className="relative">
          <Input
            placeholder="Simply describe your trip..."
            value={tripDescription}
            onChange={(e) => setTripDescription(e.target.value)}
            className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-border focus:border-primary pr-16"
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button
            onClick={handleSubmit}
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl px-4"
          >
            Submit
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* IG Reel Link */}
      <div className="flex items-center gap-2 text-primary hover:text-primary-dark cursor-pointer transition-colors">
        <Instagram className="w-5 h-5" />
        <span className="text-sm font-medium">IG Reel to Trip</span>
      </div>
    </div>
  );
};

export default HeroSection;