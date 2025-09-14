import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      type: "ai",
      content: "I'm Airial, your personal AI travel agent. Simply describe your trip and I will create a fully personalized dream vacation for you planned to the last detail - flights, hotels and day-by-day plans.\n\nYour perfect vacation is seconds away — what's on your mind?",
      timestamp: new Date()
    }
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isVibeExpanded, setIsVibeExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Trip data collection - shared with other components
  const [tripData, setTripData] = useState({
    destination: '',
    from: '',
    duration: '',
    travelTime: '',
    travelers: 1,
    preferences: []
  });

  // Questions flow for progressive data collection
  const questions = [
    {
      trigger: ['destination', 'go', 'visit', 'trip', 'travel', 'manali', 'goa', 'kerala'],
      response: (userInput) => {
        const destination = extractDestination(userInput);
        setTripData(prev => ({ ...prev, destination }));
        return `${destination} sounds amazing! Where will you be traveling from?`;
      }
    },
    {
      trigger: ['from', 'starting', 'ahmedabad', 'mumbai', 'delhi', 'bangalore'],
      response: (userInput) => {
        const from = extractLocation(userInput);
        setTripData(prev => ({ ...prev, from }));
        return `Perfect! How many days are you planning to stay?`;
      }
    },
    {
      trigger: ['days', 'day', 'week', 'month', '5', '7', '10'],
      response: (userInput) => {
        const duration = extractDuration(userInput);
        setTripData(prev => ({ ...prev, duration }));
        return `Great! When are you planning to travel?`;
      }
    },
    {
      trigger: ['when', 'october', 'november', 'december', 'january', 'february'],
      response: (userInput) => {
        const travelTime = extractTravelTime(userInput);
        setTripData(prev => ({ ...prev, travelTime }));
        return `Excellent timing! How many people will be traveling?`;
      }
    },
    {
      trigger: ['people', 'person', 'travelers', 'members', '1', '2', '3', '4'],
      response: (userInput) => {
        const travelers = extractTravelers(userInput);
        setTripData(prev => ({ ...prev, travelers }));
        return `Perfect! Based on your ${tripData.destination || 'destination'} trip details, let me show you some amazing experiences to choose from. I'll create a personalized selection for you!`;
      }
    }
  ];

  // Helper functions to extract information from user messages
  const extractDestination = (text) => {
    const destinations = ['manali', 'goa', 'kerala', 'rajasthan', 'himachal', 'ladakh', 'shimla'];
    const found = destinations.find(dest => text.toLowerCase().includes(dest));
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : 'your destination';
  };

  const extractLocation = (text) => {
    const locations = ['ahmedabad', 'mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai'];
    const found = locations.find(loc => text.toLowerCase().includes(loc));
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : 'your location';
  };

  const extractDuration = (text) => {
    const match = text.match(/(\d+)\s*(day|week)/i);
    if (match) {
      return `${match[1]} ${match[2]}${match[1] > 1 ? 's' : ''}`;
    }
    const numberMatch = text.match(/(\d+)/);
    return numberMatch ? `${numberMatch[1]} days` : '5 days';
  };

  const extractTravelTime = (text) => {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                   'july', 'august', 'september', 'october', 'november', 'december'];
    const found = months.find(month => text.toLowerCase().includes(month));
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : 'October';
  };

  const extractTravelers = (text) => {
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Check if we should show preferences after collecting all data
    if (currentQuestion >= questions.length - 1 && !isVibeExpanded) {
      setTimeout(() => {
        setIsVibeExpanded(true);
      }, 1000);
      return;
    }

    // Process based on current question in the flow
    const question = questions[currentQuestion];
    if (question && question.trigger.some(trigger => lowerMessage.includes(trigger))) {
      const response = question.response(message);
      setCurrentQuestion(prev => prev + 1);
      return response;
    }

    // Default responses for unmatched messages
    const defaultResponses = [
      "That's interesting! Could you tell me more about your travel plans?",
      "I'd love to help you plan the perfect trip. What destination do you have in mind?",
      "Great! Let's start planning your adventure. Where would you like to go?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = { type: "user", content: newMessage, timestamp: new Date() };
      setMessages(prev => [...prev, userMessage]);
      
      const messageContent = newMessage;
      setNewMessage("");
      setIsTyping(true);
      
      setTimeout(() => {
        const aiResponse = processMessage(messageContent);
        if (aiResponse) {
          setMessages(prev => [...prev, { 
            type: "ai", 
            content: aiResponse,
            timestamp: new Date()
          }]);
        }
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExpandVibe = () => {
    setIsVibeExpanded(true);
  };

  const handlePreferencesComplete = () => {
    // Store trip data in localStorage for other components to access
    localStorage.setItem('tripData', JSON.stringify(tripData));
    
    setMessages(prev => [...prev, 
      { type: "user", content: "I've selected my preferences!", timestamp: new Date() },
      { 
        type: "ai", 
        content: "Excellent choices! Based on your preferences, I've curated the perfect destinations for your trip. Let me show you the itinerary.", 
        timestamp: new Date() 
      }
    ]);
    
    // Navigate to destinations page
    setTimeout(() => {
      navigate("/destinations");
    }, 2000);
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

          {/* Vibe Preferences Section - Shows after collecting all trip details */}
          {isVibeExpanded && (
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden">
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
                    Follow your inspiration — Airial will connect the dots and create a journey filled with moments that feel just right.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Based on your {tripData.destination} trip, I'm preparing personalized experiences for you!
                  </p>
                  <Button 
                    onClick={() => navigate("/preferences")}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Explore Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div className="flex-1">
                <div className="mb-1">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Airial</span>
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
                <span className="text-white text-sm font-semibold">A</span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Ask Airial ..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400"
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
                    disabled={!newMessage.trim()}
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