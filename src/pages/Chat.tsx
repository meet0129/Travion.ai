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
      content: "Hey there, adventure seeker! 🚀 Ready to discover some incredible places? Drop me a message and let's start crafting your perfect Indian getaway!",
      timestamp: new Date()
    }
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGeminiInitialized, setIsGeminiInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [isVibeExpanded, setIsVibeExpanded] = useState(false);
  const [preferencesShown, setPreferencesShown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExperiences, setSelectedExperiences] = useState([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [questioningStarted, setQuestioningStarted] = useState(false);
  const messagesEndRef = useRef(null);

  // Simplified trip context - only essential info
  const [tripContext, setTripContext] = useState({
    destination: '',
    startLocation: '',
    startDate: '',
    endDate: '',
    duration: '',
    travelers: 0,
    isComplete: false,
    currentQuestion: 0 // Track which question we're on
  });

  // Enhanced questions with cool messaging
  const questions = [
    { 
      key: 'destination', 
      text: "Alright, let's dive in! 🌟 Which amazing place is calling your name? Think Goa's beaches, Kerala's backwaters, or maybe Rajasthan's royal vibes?" 
    },
    { 
      key: 'startLocation', 
      text: "Perfect choice! Now, which city are you starting this epic journey from? 🛫" 
    },
    { 
      key: 'startDate', 
      text: "Awesome! When do you want to kick off this adventure? Just give me the date that works for you! 📅✨" 
    },
    {     
      key: 'endDate', 
      text: "Sweet! And when should we wrap up this incredible experience? 🏁" 
    },
    { 
      key: 'duration', 
      text: "Nice! How many days of pure wanderlust are we talking about? 🗓️⚡" 
    },
    { 
      key: 'travelers', 
      text: "Last one! How many explorers are joining this adventure? Solo trip or bringing the crew? 👥🎒" 
    }
  ];

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

  // Auto-scroll to bottom with smooth animation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ask the next question in sequence with cool responses
  const askNextQuestion = (questionIndex) => {
    if (questionIndex < questions.length) {
      const question = questions[questionIndex];
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: "ai", 
          content: question.text,
          timestamp: new Date()
        }]);
        setTripContext(prev => ({ ...prev, currentQuestion: questionIndex }));
      }, 1200);
    }
  };

  // Enhanced extraction logic for each field
  const extractTripInfo = (message, currentContext) => {
    const newContext = { ...currentContext };
    const lowerMessage = message.toLowerCase().trim();
    const currentQuestionKey = questions[currentContext.currentQuestion]?.key;
    
    switch (currentQuestionKey) {
      case 'destination':
        const indianDestinations = [
          'goa', 'kerala', 'rajasthan', 'mumbai', 'delhi', 'bangalore', 'chennai', 
          'kolkata', 'jaipur', 'udaipur', 'jodhpur', 'agra', 'varanasi', 'rishikesh', 
          'manali', 'shimla', 'darjeeling', 'ooty', 'kodaikanal', 'munnar', 'alleppey', 
          'kochi', 'mysore', 'hampi', 'pushkar', 'bikaner', 'jaisalmer', 'mount abu', 
          'haridwar', 'dehradun', 'nainital', 'mussoorie', 'kasol', 'mcleod ganj', 
          'leh', 'ladakh', 'andaman', 'nicobar', 'gokarna', 'coorg', 'wayanad'
        ];
        
        for (const dest of indianDestinations) {
          if (lowerMessage.includes(dest)) {
            newContext.destination = dest.charAt(0).toUpperCase() + dest.slice(1);
            break;
          }
        }
        if (!newContext.destination && lowerMessage.length < 30) {
          newContext.destination = message.trim();
        }
        break;

      case 'startLocation':
        const indianCities = [
          'ahmedabad', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'pune', 
          'hyderabad', 'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 
          'thane', 'bhopal', 'visakhapatnam', 'vadodara', 'ludhiana', 'agra', 'nashik', 
          'faridabad', 'meerut', 'rajkot', 'varanasi', 'srinagar', 'aurangabad', 
          'amritsar', 'allahabad', 'ranchi', 'coimbatore', 'jabalpur', 'gwalior', 
          'vijayawada', 'jodhpur', 'madurai', 'raipur', 'kota', 'guwahati', 'chandigarh'
        ];
        
        for (const city of indianCities) {
          if (lowerMessage.includes(city)) {
            newContext.startLocation = city.charAt(0).toUpperCase() + city.slice(1);
            break;
          }
        }
        if (!newContext.startLocation && lowerMessage.length < 30) {
          newContext.startLocation = message.trim();
        }
        break;

      case 'startDate':
        const datePatterns = [
          /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
          /(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{1,2})/i,
          /(next\s+week|this\s+week|next\s+month|this\s+month)/i,
          /(tomorrow|today|day\s+after\s+tomorrow)/i
        ];
        
        for (const pattern of datePatterns) {
          if (pattern.test(lowerMessage)) {
            newContext.startDate = message.trim();
            break;
          }
        }
        if (!newContext.startDate) {
          newContext.startDate = message.trim();
        }
        break;

      case 'endDate':
        const endDatePatterns = [
          /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
          /(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{1,2})/i,
          /(after\s+\d+\s+days?)/i
        ];
        
        for (const pattern of endDatePatterns) {
          if (pattern.test(lowerMessage)) {
            newContext.endDate = message.trim();
            break;
          }
        }
        if (!newContext.endDate) {
          newContext.endDate = message.trim();
        }
        break;

      case 'duration':
        const durationMatch = lowerMessage.match(/(\d+)\s*(?:days?|weeks?|months?)?/);
        if (durationMatch) {
          const num = parseInt(durationMatch[1]);
          if (lowerMessage.includes('week')) {
            newContext.duration = `${num * 7} days`;
          } else if (lowerMessage.includes('month')) {
            newContext.duration = `${num * 30} days`;
          } else {
            newContext.duration = `${num} days`;
          }
        } else if (!newContext.duration) {
          newContext.duration = message.trim();
        }
        break;

      case 'travelers':
        const travelerMatch = lowerMessage.match(/(\d+)/);
        if (travelerMatch) {
          newContext.travelers = parseInt(travelerMatch[1]);
        } else if (lowerMessage.includes('solo') || lowerMessage.includes('alone') || lowerMessage.includes('just me')) {
          newContext.travelers = 1;
        } else if (lowerMessage.includes('two') || lowerMessage.includes('couple')) {
          newContext.travelers = 2;
        }
        break;

      default:
        break;
    }
    
    return newContext;
  };

  // Cool response messages
  const getCoolResponse = (questionKey, value) => {
    const responses = {
      destination: [
        `${value}! Now we're talking! 🔥 That's going to be absolutely incredible!`,
        `Ohh ${value}! Excellent choice! This is going to be epic! 🚀`,
        `${value} it is! I can already feel the adventure vibes! ✨`
      ],
      startLocation: [
        `Starting from ${value}! Perfect, I'm mapping out the best route! 🗺️`,
        `${value} to your destination - this journey is going to be amazing! 🛣️`,
        `Departing from ${value}! The adventure begins! 🌟`
      ],
      startDate: [
        `${value} - marked on my calendar! Can't wait! 📅✨`,
        `${value} sounds perfect! The countdown begins! ⏰🎉`,
        `${value} - that timing is going to be fantastic! 🗓️⚡`
      ],
      endDate: [
        `Returning ${value} - giving you the perfect amount of time to soak it all in! 🌅`,
        `${value} wrap-up! That's a solid timeline for maximum fun! 🏆`,
        `Back by ${value} - you'll return with incredible memories! 💫`
      ],
      duration: [
        `${value} of pure adventure! That's the sweet spot! ⚡`,
        `${value} - plenty of time to create magical moments! 🎭`,
        `${value} of exploration ahead! This is going to be wild! 🌈`
      ],
      travelers: [
        `${value} adventurers! The more the merrier! 👥🎒`,
        `Party of ${value}! This group is going to have a blast! 🎉`,
        `${value} explorers ready for action! Love the energy! 🚀`
      ]
    };
    
    const responseArray = responses[questionKey] || [`${value} - awesome!`];
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  // Process message and handle question flow
  const processMessage = async (message) => {
    if (!isGeminiInitialized) {
      throw new Error('Gemini AI is not initialized');
    }

    if (!questioningStarted) {
      setQuestioningStarted(true);
      // Start asking questions after user interaction
      setTimeout(() => {
        askNextQuestion(0);
      }, 800);
      return "Awesome! Let's plan something incredible together! 🎯";
    }

    try {
      const updatedContext = extractTripInfo(message, tripContext);
      setTripContext(updatedContext);
      
      const currentQuestionKey = questions[updatedContext.currentQuestion]?.key;
      const hasAnswered = updatedContext[currentQuestionKey] && 
                         (currentQuestionKey !== 'travelers' || updatedContext[currentQuestionKey] > 0);
      
      if (hasAnswered) {
        const nextQuestionIndex = updatedContext.currentQuestion + 1;
        
        if (nextQuestionIndex < questions.length) {
          askNextQuestion(nextQuestionIndex);
          return getCoolResponse(currentQuestionKey, updatedContext[currentQuestionKey]);
        } else {
          // All questions answered - show preferences
          updatedContext.isComplete = true;
          setTripContext(updatedContext);
          
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              type: "ai", 
              content: `🎊 Fantastic! Here's what we've got planned:

📍 **Destination:** ${updatedContext.destination}
🚀 **Starting from:** ${updatedContext.startLocation}  
📅 **Dates:** ${updatedContext.startDate} to ${updatedContext.endDate}
⏰ **Duration:** ${updatedContext.duration}
👥 **Travel squad:** ${updatedContext.travelers} ${updatedContext.travelers === 1 ? 'solo explorer' : 'adventurers'}

Now for the fun part! Time to pick what excites you most about ${updatedContext.destination}! 🎯`,
              timestamp: new Date()
            }]);
            
            setTimeout(() => {
              setIsVibeExpanded(true);
              setPreferencesShown(true);
              setSelectedCategory(`${updatedContext.destination}: Attractions`);
            }, 1500);
          }, 1000);
          
          return getCoolResponse(currentQuestionKey, updatedContext[currentQuestionKey]);
        }
      } else {
        return `Hmm, I didn't catch that clearly! ${questions[updatedContext.currentQuestion].text}`;
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isGeminiInitialized) return;

    const userMessage = { type: "user", content: newMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    
    const messageContent = newMessage;
    setNewMessage("");
    setIsTyping(true);
    setError(null);
    setHasUserInteracted(true);
    
    try {
      const aiResponse = await processMessage(messageContent);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: "ai", 
          content: aiResponse,
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 800);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while processing your message');
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: "ai", 
          content: "Oops! Something went wrong on my end. Mind giving that another shot? 🔄",
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Dummy experiences data
  const getDummyExperiences = (destination) => [
    {
      id: "attraction-1",
      title: `${destination} Main Attraction`,
      description: `Experience the most iconic landmark and cultural hub of ${destination}.`,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
      category: `${destination}: Attractions`,
      rating: 4.8,
      duration: "4-6 hours",
      price: "₹500-1500",
      tags: ["Culture", "Historic", "Photography"]
    },
    {
      id: "attraction-2", 
      title: `${destination} Heritage Site`,
      description: `Ancient temples and heritage sites showcasing ${destination}'s rich history.`,
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop&q=80",
      category: `${destination}: Attractions`,
      rating: 4.6,
      duration: "2-3 hours",
      price: "₹100-500",
      tags: ["Spiritual", "Architecture", "History"]
    },
    {
      id: "daytrip-1",
      title: `${destination} Adventure Day`,
      description: `Full day adventure with outdoor activities and natural exploration.`,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&q=80", 
      category: `${destination}: Day Trips`,
      rating: 4.5,
      duration: "Full day",
      price: "₹1500-3000",
      tags: ["Adventure", "Nature", "Trekking"]
    },
    {
      id: "hidden-1",
      title: `${destination} Hidden Gem`,
      description: `Secret spots known only to locals, perfect for unique experiences.`,
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop&q=80",
      category: `${destination}: Hidden Gems`,
      rating: 4.8,
      duration: "3-4 hours",
      price: "₹300-600",
      tags: ["Nature", "Photography", "Off-beat"]
    },
    {
      id: "food-1",
      title: `${destination} Food Experience`,
      description: `Authentic street food tour and local culinary specialties.`,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&q=80",
      category: `${destination}: Food & Cafes`,
      rating: 4.9,
      duration: "3-4 hours",
      price: "₹500-1000",
      tags: ["Food", "Street Food", "Local"]
    }
  ];

  const toggleExperience = (experienceId) => {
    setSelectedExperiences(prev => 
      prev.includes(experienceId)
        ? prev.filter(id => id !== experienceId)
        : [...prev, experienceId]
    );
  };

  const handlePreferencesComplete = () => {
    const tripData = {
      destination: tripContext.destination,
      from: tripContext.startLocation,
      startDate: tripContext.startDate,
      endDate: tripContext.endDate,
      duration: tripContext.duration,
      travelers: tripContext.travelers,
      preferences: selectedExperiences
    };
    
    try {
      sessionStorage.setItem('tripData', JSON.stringify(tripData));
    } catch (e) {
      console.log('SessionStorage not available');
    }
    
    setMessages(prev => [...prev, 
      { type: "user", content: "Perfect! I've selected my preferences!", timestamp: new Date() },
      { 
        type: "ai", 
        content: `🚀 Incredible! Your personalized ${tripContext.destination} adventure is taking shape! I'm crafting something absolutely amazing with your ${selectedExperiences.length} handpicked experiences. Ready to explore? Let's make this happen! 🎉✨`, 
        timestamp: new Date() 
      }
    ]);
    
    setTimeout(() => {
      navigate("/destinations");
    }, 2500);
  };

  const getCategories = (destination) => [
    `${destination}: Attractions`,
    `${destination}: Day Trips`, 
    `${destination}: Hidden Gems`,
    `${destination}: Food & Cafes`
  ];

  const categories = tripContext.destination ? getCategories(tripContext.destination) : [];
  const experiences = tripContext.destination ? getDummyExperiences(tripContext.destination) : [];
  const filteredExperiences = experiences.filter(exp => exp.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 font-['Inter',sans-serif]">
      <div className="w-full max-w-4xl mx-auto px-4 pt-6">
        <Sidebar />
        
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</div>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-auto">×</Button>
          </div>
        )}
        
        {/* Chat Messages */}
        <div className="space-y-6 mb-8">
          {messages.map((message, index) => (
            <div key={index} className="animate-in slide-in-from-bottom-8 duration-500" style={{animationDelay: `${index * 0.1}s`}}>
              {message.type === 'ai' ? (
                <div className="flex gap-3 items-start group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 transform transition-all duration-300 group-hover:scale-110 shadow-lg">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-wide">Travion</span>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                      <p className="text-slate-900 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-line font-medium">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 items-start justify-end group">
                  <div className="flex-1 flex justify-end">
                    <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl px-4 py-3 max-w-xs shadow-md transform transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02]">
                      <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold">
                        {message.content}
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 flex items-center justify-center flex-shrink-0 transform transition-all duration-300 group-hover:scale-110 shadow-lg">
                    <span className="text-white text-sm font-bold">U</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Preferences Widget - Persistent when shown */}
          {preferencesShown && tripContext.isComplete && (
            <div className={`bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ${
              isVibeExpanded ? 'animate-in slide-in-from-bottom-8' : 'animate-in fade-in'
            }`}>
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-wide">Select Your Preferences</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsVibeExpanded(!isVibeExpanded)}
                    className="text-purple-600 hover:text-purple-700 transition-colors duration-200"
                  >
                    {isVibeExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
                
                {isVibeExpanded && (
                  <div className="mt-4 animate-in slide-in-from-top-4 duration-300">
                    <h4 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2 tracking-tight">
                      Pick What You Love <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Choose experiences that match your travel style and interests.
                    </p>
                  </div>
                )}
              </div>

              {isVibeExpanded && (
                <div className="p-6 animate-in fade-in duration-500">
                  {/* Category Tabs */}
                  <div className="mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          onClick={() => setSelectedCategory(category)}
                          className={`whitespace-nowrap rounded-full text-sm flex-shrink-0 font-semibold transition-all duration-300 transform hover:scale-105 ${
                            selectedCategory === category 
                              ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-lg' 
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {category.split(': ')[1]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Experience Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {filteredExperiences.map((experience, index) => (
                      <Card 
                        key={experience.id}
                        className={`relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl group ${
                          selectedExperiences.includes(experience.id) 
                            ? 'ring-2 ring-purple-500 shadow-lg scale-105' 
                            : 'hover:ring-2 hover:ring-purple-200'
                        }`}
                        style={{animationDelay: `${index * 0.1}s`}}
                        onClick={() => toggleExperience(experience.id)}
                      >
                        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                          <img 
                            src={experience.image} 
                            alt={experience.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          
                          {/* Heart Button */}
                          <div className="absolute top-2 right-2">
                            <div
                              className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center transform ${
                                selectedExperiences.includes(experience.id)
                                  ? 'bg-purple-500 text-white scale-125 animate-pulse'
                                  : 'bg-white/90 text-slate-600 hover:scale-110'
                              }`}
                            >
                              <Heart 
                                className={`w-4 h-4 transition-all duration-300 ${
                                  selectedExperiences.includes(experience.id) ? 'fill-white' : ''
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm tracking-wide">
                            {experience.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-medium">
                            {experience.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-slate-600 font-semibold">{experience.rating}</span>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">{experience.duration}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Continue Button */}
                  <Button 
                    onClick={handlePreferencesComplete}
                    disabled={selectedExperiences.length === 0}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full h-12 text-base font-bold shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {selectedExperiences.length > 0 
                      ? `🚀 Create My ${tripContext.destination} Adventure (${selectedExperiences.length} selected)`
                      : 'Select at least one preference to continue'
                    }
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-start group animate-in slide-in-from-bottom-4 duration-300">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                <span className="text-white text-sm font-bold">T</span>
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-wide">Travion</span>
                </div>
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-medium animate-pulse">Thinking of something awesome...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 pt-4">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white text-sm font-bold">T</span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder={
                    isGeminiInitialized 
                      ? (tripContext.isComplete ? "Chat completed! Check your preferences above ✨" : "Type your message here...")
                      : "Initializing AI..."
                  }
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isGeminiInitialized || tripContext.isComplete}
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400 disabled:opacity-50 font-medium"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !isGeminiInitialized || isTyping || tripContext.isComplete}
                    className="w-8 h-8 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 dark:from-slate-600 dark:to-slate-700 dark:hover:from-slate-500 dark:hover:to-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-md"
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