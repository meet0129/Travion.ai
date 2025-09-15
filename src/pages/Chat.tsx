import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Bot, User as UserIcon, ThumbsUp, ThumbsDown, RotateCcw, Send } from 'lucide-react';
import userAvatar from '../assets/default-avatar.svg';
import Sidebar from '../components/Sidebar';
import { initializeGemini, sendMessageToGemini } from '../lib/gemini';

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
  const messagesEndRef = useRef(null);

  // Simplified trip context - only essential info
  const [tripContext, setTripContext] = useState({
    destination: '',
    startLocation: '',
    startDate: '',
    endDate: '',
    duration: '',
    travelers: 0,
    isComplete: false
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

  // Auto-scroll to bottom with smooth animation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract trip information from message
  const extractTripInfo = (message, currentContext) => {
    const newContext = { ...currentContext };
    const lowerMessage = message.toLowerCase().trim();

    // Extract destination
    const indianDestinations = [
      'goa', 'kerala', 'rajasthan', 'mumbai', 'delhi', 'bangalore', 'chennai',
      'kolkata', 'jaipur', 'udaipur', 'jodhpur', 'agra', 'varanasi', 'rishikesh',
      'manali', 'shimla', 'darjeeling', 'ooty', 'kodaikanal', 'munnar', 'alleppey',
      'kochi', 'mysore', 'hampi'
    ];

    for (const dest of indianDestinations) {
      if (lowerMessage.includes(dest)) {
        newContext.destination = dest.charAt(0).toUpperCase() + dest.slice(1);
        break;
      }
    }

    // Extract start location
    const indianCities = [
      'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune',
      'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kochi', 'chandigarh'
    ];

    for (const city of indianCities) {
      if (lowerMessage.includes(`from ${city}`)) {
        newContext.startLocation = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }

    // Extract dates and duration
    const dateMatch = message.match(/(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:\s+\d{4})?)/gi);
    if (dateMatch) {
      if (!newContext.startDate) {
        newContext.startDate = dateMatch[0];
        if (dateMatch[1]) {
          newContext.endDate = dateMatch[1];
        }
      }
    }

    const durationMatch = message.match(/(\d+)\s*(?:days?|weeks?|months?)/i);
    if (durationMatch) {
      const num = parseInt(durationMatch[1]);
      if (durationMatch[0].includes('week')) {
        newContext.duration = `${num * 7} days`;
      } else if (durationMatch[0].includes('month')) {
        newContext.duration = `${num * 30} days`;
      } else {
        newContext.duration = `${num} days`;
      }
    }

    // Extract number of travelers
    const travelerMatch = message.match(/(\d+)\s*(?:people|persons?|travelers?|friends?|family\s*members?)/i);
    if (travelerMatch) {
      newContext.travelers = parseInt(travelerMatch[1]);
    } else if (lowerMessage.includes('solo') || lowerMessage.includes('alone') || lowerMessage.includes('just me')) {
      newContext.travelers = 1;
    } else if (lowerMessage.includes('couple') || lowerMessage.includes('two of us')) {
      newContext.travelers = 2;
    }

    return newContext;
  };

  // Process message and handle conversation flow
  const processMessage = async (message) => {
    if (!isGeminiInitialized) {
      throw new Error('Gemini AI is not initialized');
    }

    try {
      // Send message to Gemini and get response
      const aiResponse = await sendMessageToGemini(message, tripContext);

      // Extract information from user's message
      const updatedContext = extractTripInfo(message, tripContext);
      setTripContext(updatedContext);

      // If Gemini indicates all information is collected, show preferences
      if (aiResponse.toLowerCase().includes("let's move on to your travel preferences")) {
        updatedContext.isComplete = true;
        setTripContext(updatedContext);

        setTimeout(() => {
          setMessages(prev => [...prev, {
            type: "ai",
            content: `🎊 Here's your travel plan:

📍 **Destination:** ${updatedContext.destination}
🚀 **Starting from:** ${updatedContext.startLocation}  
📅 **Dates:** ${updatedContext.startDate}${updatedContext.endDate ? ` to ${updatedContext.endDate}` : ''}
⏰ **Duration:** ${updatedContext.duration || 'To be calculated'}
👥 **Travel squad:** ${updatedContext.travelers} ${updatedContext.travelers === 1 ? 'solo explorer' : 'adventurers'}

Time to personalize your ${updatedContext.destination} experience! 🎯`,
            timestamp: new Date()
          }]);

          setTimeout(() => {
            setPreferencesShown(true);
          }, 1500);
        }, 1000);
      }

      return aiResponse;
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

  // Get categories for a destination
  const getCategories = (destination) => [
    `${destination}: Attractions`,
    `${destination}: Day Trips`,
    `${destination}: Hidden Gems`,
    `${destination}: Food & Cafes`
  ];

  // Toggle selected experiences
  const toggleExperience = (experienceId) => {
    setSelectedExperiences(prev =>
      prev.includes(experienceId)
        ? prev.filter(id => id !== experienceId)
        : [...prev, experienceId]
    );
  };

  // Handle completion of preferences selection
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
      content: `🚀 Incredible! Your personalized ${tripContext.destination} adventure is taking shape! I'm crafting something amazing with your ${selectedExperiences.length} handpicked experiences. Ready to explore? Let's make this happen! 🎉✨`,
      timestamp: new Date()
    }
    ]);

    setTimeout(() => {
      navigate("/destinations");
    }, 2500);
  };

  // Get dummy experiences for a destination
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-['Inter',sans-serif]">
      <div className="w-full max-w-3xl mx-auto px-4 pt-6">
        <Sidebar />

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</div>
          </div>
        )}

        <div className="space-y-8 mb-28">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3`}
            >
              {message.type === 'ai' ? (
                <div className="flex items-start gap-3 max-w-[92%]">
                  <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">Travion.ai</div>
                    <div className="rounded-none border-0 bg-transparent p-0">
                      <div className="prose dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }} />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-1 text-slate-400 dark:text-slate-500">
                        <button className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" title="Good response" aria-label="Good response"><ThumbsUp className="h-4 w-4" /></button>
                        <button className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" title="Bad response" aria-label="Bad response"><ThumbsDown className="h-4 w-4" /></button>
                        <button className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" title="Undo" aria-label="Undo"><RotateCcw className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 max-w-[92%]">
                  <img src={userAvatar} alt="You" className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">You</div>
                    <div className="p-0">
                      <div className="whitespace-pre-wrap text-slate-900 dark:text-slate-100">{message.content}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {preferencesShown && tripContext.isComplete && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  Choose Your Travel Style
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getCategories(tripContext.destination).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                    >
                      {category.split(":")[1]}
                    </button>
                  ))}
                </div>
              </div>

              {selectedCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50 duration-500">
                  {getDummyExperiences(tripContext.destination)
                    .filter((exp) => exp.category === selectedCategory)
                    .map((experience, index) => (
                      <div
                        key={experience.id}
                        className={`group bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl border border-slate-200/50 dark:border-slate-700/50 animate-in slide-in-from-bottom-2 ${
                          selectedExperiences.includes(experience.id)
                            ? "ring-2 ring-purple-500 shadow-purple-100 dark:shadow-purple-900/20"
                            : "hover:ring-2 hover:ring-purple-200 dark:hover:ring-purple-800"
                          }`}
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                        onClick={() => toggleExperience(experience.id)}
                      >
                        <div className="relative">
                          <img
                            src={experience.image}
                            alt={experience.title}
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {experience.title}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                            {experience.description}
                          </p>
                          <div className="flex items-center justify-between mt-4 text-sm">
                            <span className="text-slate-600 dark:text-slate-300">{experience.duration}</span>
                            <span className="font-medium text-purple-600 dark:text-purple-400">{experience.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {selectedExperiences.length > 0 && (
                <div className="flex justify-center animate-in slide-in-from-bottom-4 duration-500">
                  <button
                    onClick={handlePreferencesComplete}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 transform"
                  >
                    Continue with {selectedExperiences.length} experiences
                  </button>
                </div>
              )}
            </div>
          )}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="flex space-x-2 bg-white dark:bg-slate-800 rounded-lg p-3">
                <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 pt-4">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-end gap-2 p-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-0 focus:ring-0 resize-none h-10 max-h-40 overflow-auto"
                style={{ height: "40px" }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isGeminiInitialized}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;