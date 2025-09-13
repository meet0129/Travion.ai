import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";  
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowRight } from "lucide-react";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";

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
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content */}
      <div className="min-h-screen lg:ml-0">
        <div className="p-4 lg:p-6 pb-32 lg:pb-6 lg:pl-4">{/* Added bottom padding for mobile input */}
          <div className="max-w-6xl mx-auto">
            {/* AI Message */}
            <div className="mb-6 lg:mb-8">
              <div className="flex gap-3 lg:gap-4">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs lg:text-sm">T</span>
                </div>
                <div className="flex-1">
                  <div className="bg-card border border-border rounded-2xl p-3 lg:p-4 mb-4">
                    <p className="text-card-foreground text-sm lg:text-base leading-relaxed">
                      Perfect! October is ideal for Manali - crisp mountain air and stunning autumn colors await your group. Here are some incredible experiences to consider for your 7-day adventure:
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skip Button */}
            <div className="flex justify-center lg:justify-end mb-6">
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
            <div className="bg-card border border-border rounded-3xl p-4 lg:p-8">
              <div className="flex items-center gap-2 mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-card-foreground">Pick What You Love</h2>
                <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-red-500 fill-red-500" />
              </div>
              
              <p className="text-muted-foreground mb-4 lg:mb-6 text-sm lg:text-base">
                <Heart className="w-4 h-4 text-red-500 fill-red-500 inline mr-1" />
                Follow your Inspiration — Travion will connect the dots and create a journey filled with moments that feel just right.
              </p>

              {/* Category Tabs */}
              <div className="flex gap-2 mb-6 lg:mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap rounded-full text-sm lg:text-base flex-shrink-0"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Experience Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                {experiences.map((experience) => (
                  <Card 
                    key={experience.id}
                    className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-95 ${
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
                      <div className="absolute top-2 right-2 lg:top-3 lg:right-3">
                        <Button
                          size="icon"
                          variant={selectedExperiences.includes(experience.id) ? "default" : "outline"}
                          className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-white/90 hover:bg-white touch-manipulation"
                        >
                          <Heart 
                            className={`w-3 h-3 lg:w-4 lg:h-4 ${
                              selectedExperiences.includes(experience.id) 
                                ? 'text-red-500 fill-red-500' 
                                : 'text-gray-600'
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 lg:p-4">
                      <h3 className="font-semibold text-card-foreground mb-2 text-sm lg:text-base">{experience.title}</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">{experience.description}</p>
                    </div>
                  </Card>
                ))}
            </div>

              {/* Continue Button - Mobile First */}
              <div className="flex flex-col items-center space-y-4 lg:space-y-0 lg:flex-row lg:justify-center lg:items-center lg:gap-4">
                <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span className="text-center lg:text-left">Save one or more experiences to Continue</span>
                </div>
                <Button 
                  className="rounded-full px-6 lg:px-8 w-full sm:w-auto"
                  disabled={selectedExperiences.length === 0}
                  onClick={() => window.location.href = '/destinations'}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2 lg:gap-4 mt-4 lg:mt-6 text-muted-foreground">
                <Button variant="ghost" size="sm" className="h-8 w-8 lg:h-9 lg:w-9">👍</Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 lg:h-9 lg:w-9">👎</Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 lg:h-9 lg:w-auto lg:px-3">
                  <span className="hidden lg:inline">↶ Undo</span>
                  <span className="lg:hidden">↶</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Input - Fixed on Mobile */}
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 lg:relative lg:mt-6 lg:border-t-0 lg:p-0 lg:bg-transparent lg:backdrop-blur-none">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 lg:gap-4 bg-card border border-border rounded-full px-4 lg:px-6 py-3">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">T</span>
                </div>
                <input 
                  type="text" 
                  placeholder="Ask Travion..."
                  className="flex-1 bg-transparent border-none outline-none text-card-foreground text-sm lg:text-base"
                />
                <ArrowRight className="w-5 h-5 text-muted-foreground cursor-pointer touch-manipulation" />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Travion is in beta and can make mistakes. Please check important info.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;