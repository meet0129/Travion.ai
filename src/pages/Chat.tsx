import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ChevronDown, ChevronUp, Heart, AlertCircle, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { geminiService, initializeGemini, sendMessageToGemini } from "@/lib/gemini";

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      type: "ai",
      content: "Hey there! 🌟 Where's your next adventure taking you? Just tell me your travel dreams and I'll craft the perfect Indian getaway for you!",
      timestamp: new Date()
    }
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGeminiInitialized, setIsGeminiInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVibeExpanded, setIsVibeExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Trip context storage for the current chat session
  const [tripContext, setTripContext] = useState({
    destination: '',
    startLocation: '',
    startDate: '',
    endDate: '',
    duration: '',
    travelers: 0,
    isComplete: false,
    extractedInfo: new Set<string>() // Track what info we've collected
  });

  // Initialize Gemini on component mount
  useEffect(() => {
    const initGemini = async () => {
      try {
        const initialized = await initializeGemini();
        setIsGeminiInitialized(initialized);
        if (!initialized) {
          setError('Gemini API is not configured. Please add your API key to the .env file.');
        }
      } catch (error) {
        console.error('Failed to initialize Gemini:', error);
        setError('Failed to initialize AI service. Please try again.');
      }
    };

    initGemini();
  }, []);

  // Check if all essential information is collected
  useEffect(() => {
    const isComplete = tripContext.destination && 
                      tripContext.startLocation &&
                      tripContext.startDate && 
                      tripContext.travelers > 0 && 
                      (tripContext.duration || tripContext.endDate);
    
    if (isComplete && !tripContext.isComplete) {
      setTripContext(prev => ({ ...prev, isComplete: true }));
      // Automatically show preferences without asking further questions
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: "ai", 
          content: `Perfect! I have all the details for your ${tripContext.destination} trip. Let's personalize your experience by selecting what interests you most!`,
          timestamp: new Date()
        }]);
        // Animate the preferences widget appearance
        setTimeout(() => {
          setIsVibeExpanded(true);
          setSelectedCategory(`${tripContext.destination}: Attractions`);
        }, 800);
      }, 1000);
    }
  }, [tripContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Dummy experiences data - will be made dynamic later
  const getDummyExperiences = (destination: string) => [
    {
      id: "attraction-1",
      title: `${destination} Main Attraction`,
      description: `Experience the most iconic landmark and cultural hub of ${destination} with guided tours.`,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
      category: `${destination}: Attractions`,
      rating: 4.8,
      duration: "4-6 hours",
      price: "₹500-1500",
      tags: ["Culture", "Historic", "Photography"]
    },
    {
      id: "attraction-2", 
      title: `${destination} Temple/Heritage Site`,
      description: `Visit the ancient temples and heritage sites that showcase ${destination}'s rich history.`,
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop&q=80",
      category: `${destination}: Attractions`,
      rating: 4.6,
      duration: "2-3 hours",
      price: "₹100-500",
      tags: ["Spiritual", "Architecture", "History"]
    },
    {
      id: "attraction-3",
      title: `${destination} Local Markets`, 
      description: `Explore bustling local markets with authentic handicrafts, spices, and street food.`,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80",
      category: `${destination}: Attractions`,
      rating: 4.7,
      duration: "Half day",
      price: "₹200-800",
      tags: ["Shopping", "Food", "Culture"]
    },
    {
      id: "attraction-4",
      title: `${destination} Scenic Viewpoint`,
      description: `Breathtaking panoramic views of ${destination} from the most popular viewpoint.`,
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop&q=80",
      category: `${destination}: Attractions`,
      rating: 4.9,
      duration: "2-3 hours",
      price: "₹50-300",
      tags: ["Scenic", "Photography", "Nature"]
    },
    {
      id: "daytrip-1",
      title: `${destination} Adventure Day Trip`,
      description: `Full day adventure including trekking, outdoor activities, and natural exploration.`,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&q=80", 
      category: `${destination}: Day Trips`,
      rating: 4.5,
      duration: "Full day",
      price: "₹1500-3000",
      tags: ["Adventure", "Nature", "Trekking"]
    },
    {
      id: "daytrip-2",
      title: `Nearby Hill Station from ${destination}`,
      description: `Visit a beautiful hill station near ${destination} with cool weather and scenic beauty.`,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
      category: `${destination}: Day Trips`,
      rating: 4.6,
      duration: "8-10 hours",
      price: "₹2000-4000",
      tags: ["Hill Station", "Scenic", "Cool Weather"]
    },
    {
      id: "hidden-1",
      title: `${destination} Hidden Waterfall`,
      description: `Discover a secret waterfall known only to locals, perfect for photography and relaxation.`,
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop&q=80",
      category: `${destination}: Hidden Gems`,
      rating: 4.8,
      duration: "3-4 hours",
      price: "₹300-600",
      tags: ["Nature", "Photography", "Off-beat"]
    },
    {
      id: "hidden-2",
      title: `${destination} Local Village Experience`,
      description: `Immerse yourself in authentic village life with home-stays and traditional activities.`,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80",
      category: `${destination}: Hidden Gems`,
      rating: 4.7,
      duration: "Half day",
      price: "₹800-1500",
      tags: ["Authentic", "Cultural", "Rural"]
    },
    {
      id: "food-1",
      title: `${destination} Food Walk`,
      description: `Guided street food tour covering the most authentic and delicious local specialties.`,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&q=80",
      category: `${destination}: Food & Cafes`,
      rating: 4.9,
      duration: "3-4 hours",
      price: "₹500-1000",
      tags: ["Food", "Street Food", "Local"]
    },
    {
      id: "food-2",
      title: `${destination} Rooftop Cafes`,
      description: `Relax at scenic rooftop cafes with panoramic views and local cuisine.`,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
      category: `${destination}: Food & Cafes`,
      rating: 4.5,
      duration: "2-3 hours",
      price: "₹300-800",
      tags: ["Cafes", "Views", "Relaxation"]
    }
  ];

  // Process message with Gemini AI and extract trip information
  const processMessage = async (message: string): Promise<string> => {
    if (!isGeminiInitialized) {
      throw new Error('Gemini AI is not initialized');
    }

    try {
      // Extract and update trip context from the conversation first
      const updatedContext = extractTripInfo(message, tripContext);
      setTripContext(updatedContext);
      
      // Check if we have all essential info to avoid asking more questions
      const hasEssentials = updatedContext.destination && 
                           updatedContext.startDate && 
                           updatedContext.travelers > 0 && 
                           (updatedContext.duration || updatedContext.endDate);
      
      if (hasEssentials && !updatedContext.isComplete) {
        // Return a confirmation message instead of asking more questions
        return `Awesome! 7 days in ${updatedContext.destination} for ${updatedContext.travelers} people, starting ${updatedContext.startDate}! I've got all the essential details. ✨ Now, let's dive into your preferences to make this trip perfect. What kind of experiences are you looking for?`;
      }
      
      // Send message with current trip context only if we don't have essentials yet
      const response = await sendMessageToGemini(message, updatedContext);
      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  };

  // Extract trip information from user message
  const extractTripInfo = (message: string, currentContext: any) => {
    const newContext = { ...currentContext };
    const lowerMessage = message.toLowerCase();
    
    console.log('Extracting from message:', message);
    console.log('Current context:', currentContext);
    
    // Extract destination
    const indianDestinations = ['goa', 'kerala', 'rajasthan', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'jaipur', 'udaipur', 'jodhpur', 'agra', 'varanasi', 'rishikesh', 'manali', 'shimla', 'darjeeling', 'ooty', 'kodaikanal', 'munnar', 'alleppey', 'kochi', 'mysore', 'hampi', 'pushkar', 'bikaner', 'jaisalmer', 'mount abu', 'haridwar', 'dehradun', 'nainital', 'mussoorie', 'kasol', 'mcleod ganj', 'leh', 'ladakh', 'andaman', 'nicobar'];
    
    for (const dest of indianDestinations) {
      if (lowerMessage.includes(dest) && !newContext.destination) {
        newContext.destination = dest.charAt(0).toUpperCase() + dest.slice(1);
        newContext.extractedInfo = new Set([...newContext.extractedInfo, 'destination']);
        console.log('Found destination:', newContext.destination);
        break;
      }
    }

    // Extract starting location (from city)
    const indianCities = ['ahmedabad', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'pune', 'hyderabad', 'surat', 'kanpur', 'jaipur', 'lucknow', 'nagpur', 'patna', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri', 'vadodara', 'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'kalyan', 'vasai', 'varanasi', 'srinagar', 'aurangabad', 'dhanbad', 'amritsar', 'navi mumbai', 'allahabad', 'ranchi', 'howrah', 'coimbatore', 'jabalpur', 'gwalior', 'vijayawada', 'jodhpur', 'madurai', 'raipur', 'kota', 'guwahati', 'chandigarh', 'solapur', 'hubli', 'mysore', 'tiruchirappalli', 'bareilly', 'aligarh', 'tiruppur', 'gurgaon', 'moradabad', 'jalandhar', 'bhubaneswar', 'salem', 'mira', 'bhiwandi', 'warangal', 'guntur', 'bhilai', 'kochi', 'amravati', 'bikaner', 'noida', 'jamshedpur', 'bhilwara', 'cuttack', 'firozabad', 'kurnool', 'rajkot', 'bokaro', 'south dumdum', 'bellary', 'patiala', 'gopalpur', 'agartala', 'bhagalpur', 'muzaffarnagar', 'bhatpara', 'panihati', 'latur', 'dhule', 'rohtak', 'korba', 'bhilwara', 'berhampur', 'muzaffarpur', 'ahmednagar', 'mathura', 'kollam', 'avadi', 'kadapa', 'kamarhati', 'sambalpur', 'bilaspur', 'shahjahanpur', 'satara', 'bijapur', 'rampur', 'shivamogga', 'chandrapur', 'junagadh', 'thrissur', 'alwar', 'bardhaman', 'kulti', 'kakinada', 'nizamabad', 'parbhani', 'tumkur', 'khammam', 'ozhukarai', 'bihar sharif', 'panipat', 'darbhanga', 'bally', 'aizawl', 'dewas', 'ichalkaranji', 'karnal', 'bathinda', 'jalna', 'eluru', 'kirari suleman nagar', 'barabanki', 'purnia', 'satna', 'mau', 'sonipat', 'farrukhabad', 'sagar', 'rourkela', 'durg', 'imphal', 'ratlam', 'hapur', 'arrah', 'karimnagar', 'anantapur', 'etawah', 'ambarnath', 'north dumdum', 'bharatpur', 'begusarai', 'new delhi', 'gandhidham', 'baranagar', 'tiruvottiyur', 'pondicherry', 'siliguri', 'loni', 'jhansi', 'ulhasnagar', 'nellore', 'jammu', 'sangli miraj kupwad', 'belgaum', 'mangalore', 'ambattur', 'tirunelveli', 'malegaon', 'gaya', 'jalgaon', 'udaipur', 'maheshtala'];
    
    // Look for "from" patterns
    const fromPatterns = [
      /from\s+([a-zA-Z\s]+?)(?:\s+to|\s+going|\s+travel|$)/,
      /starting\s+from\s+([a-zA-Z\s]+?)(?:\s+to|\s+going|\s+travel|$)/,
      /i'm\s+in\s+([a-zA-Z\s]+?)(?:\s+and|\s+going|\s+travel|$)/,
      /i\s+live\s+in\s+([a-zA-Z\s]+?)(?:\s+and|\s+going|\s+travel|$)/,
      /based\s+in\s+([a-zA-Z\s]+?)(?:\s+and|\s+going|\s+travel|$)/
    ];

    for (const pattern of fromPatterns) {
      const match = lowerMessage.match(pattern);
      if (match && !newContext.startLocation) {
        const cityName = match[1].trim().toLowerCase();
        for (const city of indianCities) {
          if (cityName.includes(city) || city.includes(cityName)) {
            newContext.startLocation = city.charAt(0).toUpperCase() + city.slice(1);
            newContext.extractedInfo = new Set([...newContext.extractedInfo, 'startLocation']);
            console.log('Found start location:', newContext.startLocation);
            break;
          }
        }
        break;
      }
    }
    
    // Extract number of travelers
    const travelerPatterns = [
      /(\d+)\s*(?:people|persons|travelers|friends|family members)/,
      /with\s*(\d+)\s*friends/,
      /group\s*of\s*(\d+)/,
      /(\d+)\s*of\s*us/,
      /(solo|alone)/,
      /just\s*me/,
      /^(\d+)$/  // Just a number by itself
    ];
    
    for (const pattern of travelerPatterns) {
      const match = lowerMessage.match(pattern);
      if (match && newContext.travelers === 0) {
        if (match[1] === 'solo' || match[1] === 'alone' || lowerMessage.includes('just me')) {
          newContext.travelers = 1;
        } else if (match[1]) {
          newContext.travelers = parseInt(match[1]);
          if (lowerMessage.includes('with') && !lowerMessage.includes('with me')) {
            newContext.travelers += 1; // Add the user themselves
          }
        }
        newContext.extractedInfo = new Set([...newContext.extractedInfo, 'travelers']);
        console.log('Found travelers:', newContext.travelers);
        break;
      }
    }
    
    // Extract duration
    const durationPatterns = [
      /(\d+)\s*(?:days|day)/,
      /(\d+)\s*(?:weeks|week)/,
      /(\d+)\s*(?:months|month)/,
      /(weekend)/,
      /(long weekend)/,
      /^(\d+)$/  // Just a number by itself (assume days if travelers already found)
    ];
    
    for (const pattern of durationPatterns) {
      const match = lowerMessage.match(pattern);
      if (match && !newContext.duration) {
        if (match[1] === 'weekend') {
          newContext.duration = '2 days';
        } else if (match[1] === 'long weekend') {
          newContext.duration = '3 days';
        } else if (match[1] && !isNaN(parseInt(match[1]))) {
          // If it's just a number and we already have travelers, assume it's duration
          if (newContext.travelers > 0 && lowerMessage.trim() === match[1]) {
            newContext.duration = `${match[1]} days`;
          } else if (lowerMessage.includes('day') || lowerMessage.includes('week') || lowerMessage.includes('month')) {
            newContext.duration = match[0];
          }
        }
        if (newContext.duration) {
          newContext.extractedInfo = new Set([...newContext.extractedInfo, 'duration']);
          console.log('Found duration:', newContext.duration);
          break;
        }
      }
    }
    
    // Extract time references (basic)
    const timePatterns = [
      /(next week|this week)/,
      /(next month|this month)/,
      /(december|january|february|march|april|may|june|july|august|september|october|november)/,
      /(summer|winter|monsoon)/,
      /after\s*(\d+)\s*days?/,
      /(tomorrow|today)/
    ];
    
    for (const pattern of timePatterns) {
      const match = lowerMessage.match(pattern);
      if (match && !newContext.startDate) {
        if (match[1] && match[1].includes('after')) {
          newContext.startDate = match[0];
        } else {
          newContext.startDate = match[1] || match[0];
        }
        newContext.extractedInfo = new Set([...newContext.extractedInfo, 'startDate']);
        console.log('Found start date:', newContext.startDate);
        break;
      }
    }
    
    console.log('Final extracted context:', newContext);
    return newContext;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isGeminiInitialized) return;

    const userMessage = { type: "user", content: newMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    
    const messageContent = newMessage;
    setNewMessage("");
    setIsTyping(true);
    setError(null);
    
    try {
      const aiResponse = await processMessage(messageContent);
      setMessages(prev => [...prev, { 
        type: "ai", 
        content: aiResponse,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while processing your message');
      
      setMessages(prev => [...prev, { 
        type: "ai", 
        content: "I'm sorry, I encountered an error while processing your message. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleExperience = (experienceId: string) => {
    setSelectedExperiences(prev => 
      prev.includes(experienceId)
        ? prev.filter(id => id !== experienceId)
        : [...prev, experienceId]
    );
  };

  const handlePreferencesComplete = () => {
    // Store trip data for other components to access
    const tripData = {
      destination: tripContext.destination,
      from: tripContext.startLocation,
      duration: tripContext.duration,
      travelTime: tripContext.startDate,
      travelers: tripContext.travelers,
      preferences: selectedExperiences
    };
    
    // Store in sessionStorage since localStorage is not available
    try {
      sessionStorage.setItem('tripData', JSON.stringify(tripData));
    } catch (e) {
      console.log('SessionStorage not available, storing in memory');
    }
    
    setMessages(prev => [...prev, 
      { type: "user", content: "I've selected my preferences!", timestamp: new Date() },
      { 
        type: "ai", 
        content: `Awesome! Based on your preferences for ${selectedExperiences.length} experiences, I'm curating the perfect destinations for your ${tripContext.destination} trip. Let me show you the itinerary!`, 
        timestamp: new Date() 
      }
    ]);
    
    // Navigate to destinations page
    setTimeout(() => {
      navigate("/destinations");
    }, 2000);
  };

  // Get categories based on destination
  const getCategories = (destination: string) => [
    `${destination}: Attractions`,
    `${destination}: Day Trips`, 
    `${destination}: Hidden Gems`,
    `${destination}: Food & Cafes`
  ];

  const categories = tripContext.destination ? getCategories(tripContext.destination) : [];
  const experiences = tripContext.destination ? getDummyExperiences(tripContext.destination) : [];
  const filteredExperiences = experiences.filter(exp => exp.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full max-w-4xl mx-auto px-4 pt-6">
        <Sidebar />
        
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 ml-auto"
            >
              ×
            </Button>
          </div>
        )}
        
        {/* Chat Messages */}
        <div className="space-y-6 mb-8">
          {messages.map((message, index) => (
            <div key={index}>
              {message.type === 'ai' ? (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Travion</span>
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

          {/* Vibe Preferences Section - Shows when all essential info is collected */}
          {isVibeExpanded && (
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Select your vibe</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsVibeExpanded(false)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    Collapse
                    <ChevronUp className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
                    Pick What You Love 
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    Follow your inspiration — I'll connect the dots and create a journey filled with moments that feel just right.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {tripContext.destination ? (
                  <>
                    {/* Category Tabs */}
                    <div className="mb-6">
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((category) => (
                          <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            onClick={() => setSelectedCategory(category)}
                            className={`whitespace-nowrap rounded-full text-sm flex-shrink-0 transition-all duration-300 ${
                              selectedCategory === category 
                                ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Experience Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {filteredExperiences.map((experience, index) => (
                        <Card 
                          key={experience.id}
                          className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group animate-in fade-in slide-in-from-bottom-4 ${
                            selectedExperiences.includes(experience.id) 
                              ? 'ring-2 ring-purple-500 shadow-md' 
                              : 'hover:ring-2 hover:ring-purple-200 dark:hover:ring-purple-800'
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() => toggleExperience(experience.id)}
                        >
                          <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                            <img 
                              src={experience.image} 
                              alt={experience.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            
                            {/* Heart Button */}
                            <div className="absolute top-2 right-2">
                              <div
                                className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center ${
                                  selectedExperiences.includes(experience.id)
                                    ? 'bg-purple-500 text-white scale-110'
                                    : 'bg-white/90 text-slate-600'
                                }`}
                              >
                                <Heart 
                                  className={`w-4 h-4 transition-all duration-300 ${
                                    selectedExperiences.includes(experience.id) 
                                      ? 'fill-white' 
                                      : ''
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Info Icon */}
                            <div className="absolute bottom-2 right-2">
                              <div className="w-6 h-6 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">i</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-3">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                              {experience.title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {experience.description}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-slate-600 dark:text-slate-400">{experience.rating}</span>
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-500">{experience.duration}</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Continue Button */}
                    <Button 
                      onClick={handlePreferencesComplete}
                      disabled={selectedExperiences.length === 0}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed animate-in slide-in-from-bottom-4"
                      style={{ animationDelay: '600ms' }}
                    >
                      {selectedExperiences.length > 0 
                        ? `Continue with ${selectedExperiences.length} Selected Preferences`
                        : 'Select at least one preference to continue'
                      }
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Tell me your destination first, and I'll show you amazing experiences to choose from!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">T</span>
              </div>
              <div className="flex-1">
                <div className="mb-1">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Travion</span>
                </div>
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Chat Input */}
        <div className="sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 pt-4">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">T</span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder={isGeminiInitialized ? "Tell me about your dream trip..." : "Initializing AI..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isGeminiInitialized}
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400 disabled:opacity-50"
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
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !isGeminiInitialized || isTyping}
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

export default Chat;