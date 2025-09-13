import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowRight, ChevronRight } from "lucide-react";
import { useState } from "react";

const Preferences = () => {
  const [selectedCategory, setSelectedCategory] = useState("Manali: Attractions");
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);

  const categories = [
    "Manali: Attractions",
    "Manali: Day Trips", 
    "Manali: Hidden Gems",
    "Manali: Food & Cafes"
  ];

  const experiences = [
    {
      id: "solang-valley",
      title: "Solang Valley",
      description: "Adventure hub for paragliding, zorbing and breathtaking views of snow-capped peaks.",
      image: "/api/placeholder/300/200",
      category: "Manali: Attractions"
    },
    {
      id: "hadimba-temple", 
      title: "Hadimba Devi Temple",
      description: "A mystical cedar forest temple with unique architecture and tranquil surroundings.",
      image: "/api/placeholder/300/200",
      category: "Manali: Attractions"
    },
    {
      id: "old-manali",
      title: "Old Manali", 
      description: "Chill cafes, bohemian vibes, and riverside walks in the charming old town.",
      image: "/api/placeholder/300/200",
      category: "Manali: Attractions"
    },
    {
      id: "vashisht-springs",
      title: "Vashisht Hot Springs",
      description: "Natural hot water baths with mountain views, perfect for relaxation.",
      image: "/api/placeholder/300/200", 
      category: "Manali: Attractions"
    }
  ];

  const toggleExperience = (experienceId: string) => {
    setSelectedExperiences(prev => 
      prev.includes(experienceId)
        ? prev.filter(id => id !== experienceId)
        : [...prev, experienceId]
    );
  };

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
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* AI Message */}
          <div className="mb-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-sm">T</span>
              </div>
              <div className="flex-1">
                <div className="bg-card border border-border rounded-2xl p-4 mb-4">
                  <p className="text-card-foreground">
                    Perfect! October is ideal for Manali - crisp mountain air and stunning autumn colors await your group. Here are some incredible experiences to consider for your 7-day adventure:
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Skip Button */}
          <div className="flex justify-end mb-6">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 rounded-full"
              onClick={() => window.location.href = '/destinations'}
            >
              Skip this step
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Pick What You Love Section */}
          <div className="bg-card border border-border rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold text-card-foreground">Pick What You Love</h2>
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            </div>
            
            <p className="text-muted-foreground mb-6">
              <Heart className="w-4 h-4 text-red-500 fill-red-500 inline mr-1" />
              Follow your Inspiration — Travion will connect the dots and create a journey filled with moments that feel just right.
            </p>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Experience Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {experiences.map((experience) => (
                <Card 
                  key={experience.id}
                  className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    selectedExperiences.includes(experience.id) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => toggleExperience(experience.id)}
                >
                  <div className="aspect-[4/3] bg-muted relative">
                    <img 
                      src={experience.image} 
                      alt={experience.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Button
                        size="icon"
                        variant={selectedExperiences.includes(experience.id) ? "default" : "outline"}
                        className="w-8 h-8 rounded-full bg-white/90 hover:bg-white"
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            selectedExperiences.includes(experience.id) 
                              ? 'text-red-500 fill-red-500' 
                              : 'text-gray-600'
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-card-foreground mb-2">{experience.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{experience.description}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Continue Button */}
            <div className="flex justify-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span>Save one or more experiences to Continue</span>
                </div>
                <Button 
                  className="rounded-full px-8"
                  disabled={selectedExperiences.length === 0}
                  onClick={() => window.location.href = '/destinations'}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 mt-6 text-muted-foreground">
              <Button variant="ghost" size="sm">👍</Button>
              <Button variant="ghost" size="sm">👎</Button>
              <Button variant="ghost" size="sm">↶ Undo</Button>
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
              <ArrowRight className="w-5 h-5 text-muted-foreground cursor-pointer" />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Travion is in beta and can make mistakes. Please check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;