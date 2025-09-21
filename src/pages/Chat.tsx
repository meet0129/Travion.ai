import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  AlertCircle,
  Bot,
  User as UserIcon,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Send,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import userAvatar from "../assets/default-avatar.svg";
import Sidebar from "../components/Sidebar";
import {
  initializeGemini,
  sendMessageToGemini,
  geminiService,
} from "../lib/gemini";
import PreferencesWidget from "../components/PreferencesWidget";
import PreferencesFolded from "../components/PreferencesFolded";
import Destinations from "../pages/Destinations";
import { useTrips } from "../contexts/TripsContext";
import { firebaseChatService } from "../lib/firebaseService";

// Trip Confirmation Dialog Component with Inline Editing
const TripConfirmationDialog = ({ tripContext, onConfirm, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContext, setEditedContext] = useState(tripContext);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContext({ ...tripContext });
  };

  const handleSave = () => {
    onUpdate(editedContext);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContext({ ...tripContext });
    setIsEditing(false);
  };

  const handleFieldChange = (field, value) => {
    setEditedContext(prev => ({
      ...prev,
      [field]: field === 'travelers' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-900">📋 Trip Summary</h3>
        {!isEditing && (
          <Button
            onClick={handleEdit}
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:text-purple-800"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-4 mb-6">
        {/* Destination */}
        <div className="flex items-center gap-3">
          <span className="font-medium text-purple-800 min-w-[120px]">📍 Destination:</span>
          {isEditing ? (
            <Input
              value={editedContext.destination || ''}
              onChange={(e) => handleFieldChange('destination', e.target.value)}
              placeholder="Enter destination"
              className="flex-1 border-purple-200 focus:border-purple-400"
            />
          ) : (
            <span className="text-purple-700 flex-1">{tripContext.destination || 'Not specified'}</span>
          )}
        </div>

        {/* Start Location */}
        <div className="flex items-center gap-3">
          <span className="font-medium text-purple-800 min-w-[120px]">🚀 From:</span>
          {isEditing ? (
            <Input
              value={editedContext.startLocation || ''}
              onChange={(e) => handleFieldChange('startLocation', e.target.value)}
              placeholder="Enter start location"
              className="flex-1 border-purple-200 focus:border-purple-400"
            />
          ) : (
            <span className="text-purple-700 flex-1">{tripContext.startLocation || 'Not specified'}</span>
          )}
        </div>

        {/* Travelers */}
        <div className="flex items-center gap-3">
          <span className="font-medium text-purple-800 min-w-[120px]">👥 Travelers:</span>
          {isEditing ? (
            <Input
              type="number"
              min="1"
              value={editedContext.travelers || ''}
              onChange={(e) => handleFieldChange('travelers', e.target.value)}
              placeholder="Number of travelers"
              className="flex-1 border-purple-200 focus:border-purple-400"
            />
          ) : (
            <span className="text-purple-700 flex-1">{tripContext.travelers || 'Not specified'}</span>
          )}
        </div>

        {/* Duration/Dates */}
        <div className="flex items-center gap-3">
          <span className="font-medium text-purple-800 min-w-[120px]">📅 Duration:</span>
          {isEditing ? (
            <Input
              value={editedContext.duration || editedContext.startDate || ''}
              onChange={(e) => handleFieldChange('duration', e.target.value)}
              placeholder="Duration (e.g., 5 days) or start date"
              className="flex-1 border-purple-200 focus:border-purple-400"
            />
          ) : (
            <span className="text-purple-700 flex-1">{tripContext.duration || tripContext.startDate || 'Not specified'}</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isEditing ? (
          <>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </>
        ) : (
          <Button
            onClick={onConfirm}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            ✅ Continue to Preferences
          </Button>
        )}
      </div>
    </div>
  );
};

const Chat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { saveTrip } = useTrips();
  const [messages, setMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(chatId || uuidv4());

  // Redirect to UUID-based URL if no chatId in URL
  useEffect(() => {
    if (!chatId && currentChatId) {
      navigate(`/chat/${currentChatId}`, { replace: true });
    }
  }, [chatId, currentChatId, navigate]);

  // Load or reset chat state when chatId changes
  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      const loadChatData = async () => {
        try {
          // Try to load from Firebase first
          const chatData = await firebaseChatService.getChat(chatId);
          if (chatData) {
            // Restore chat state from Firebase
            setMessages(chatData.messages || []);
            setTripContext(chatData.tripContext || {
              destination: '',
              startLocation: '',
              startDate: '',
              endDate: '',
              duration: '',
              travelers: 0,
              isComplete: false
            });
            setSelectedPreferences(chatData.preferences || []);
            
            // Determine current state based on data
            if (chatData.destinations && chatData.destinations.length > 0) {
              setShowDestinations(true);
            } else if (chatData.preferences && chatData.preferences.length > 0) {
              setPreferencesShown(true);
            }
            
            setHasUserInteracted(true);
          } else {
            // No Firebase data, check sessionStorage
            const storedMessages = JSON.parse(sessionStorage.getItem(`messages_${chatId}`) || '[]');
            const storedContext = JSON.parse(sessionStorage.getItem(`tripContext_${chatId}`) || '{}');
            const storedPreferences = JSON.parse(localStorage.getItem(`selectedPreferences_${chatId}`) || '[]');
            const storedUIState = JSON.parse(sessionStorage.getItem(`ui_state_${chatId}`) || '{}');
            
            if (storedMessages.length > 0 || Object.keys(storedContext).length > 0) {
              setMessages(storedMessages);
              setTripContext(storedContext);
              setSelectedPreferences(storedPreferences);
              setHasUserInteracted(true);
              
              // Restore UI state
              setPreferencesShown(storedUIState.preferencesShown || false);
              setShowDestinations(storedUIState.showDestinations || false);
              setShowSummaryConfirmation(storedUIState.showSummaryConfirmation || false);
              setIsVibeExpanded(storedUIState.isVibeExpanded || false);
            } else {
              // Fresh start - clear any existing preferences for this chat
              setMessages([]);
              setTripContext({
                destination: '',
                startLocation: '',
                startDate: '',
                endDate: '',
                duration: '',
                travelers: 0,
                isComplete: false
              });
              setSelectedPreferences([]);
              setPreferencesShown(false);
              setShowDestinations(false);
              setShowSummaryConfirmation(false);
              setHasUserInteracted(false);
              
              // Clear any existing preferences for this chat
              localStorage.removeItem(`selectedPreferences_${chatId}`);
              sessionStorage.removeItem(`selectedPreferences_${chatId}`);
            }
          }
        } catch (error) {
          console.error('Error loading chat data:', error);
          // Fallback to fresh start
          setMessages([]);
          setTripContext({
            destination: '',
            startLocation: '',
            startDate: '',
            endDate: '',
            duration: '',
            travelers: 0,
            isComplete: false
          });
          setSelectedPreferences([]);
          setPreferencesShown(false);
          setShowDestinations(false);
          setShowSummaryConfirmation(false);
          setHasUserInteracted(false);
          
          // Clear any existing preferences for this chat
          localStorage.removeItem(`selectedPreferences_${chatId}`);
          sessionStorage.removeItem(`selectedPreferences_${chatId}`);
        }
        
        // Update current chat ID
        setCurrentChatId(chatId);
        sessionStorage.setItem('currentChatId', chatId);
      };
      
      loadChatData();
    }
  }, [chatId, currentChatId]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isGeminiInitialized, setIsGeminiInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [isVibeExpanded, setIsVibeExpanded] = useState(false);
  const [preferencesShown, setPreferencesShown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExperiences, setSelectedExperiences] = useState([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showDestinations, setShowDestinations] = useState(false);
  const [showSummaryConfirmation, setShowSummaryConfirmation] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const messagesEndRef = useRef(null);

  // Persist UI state
  useEffect(() => {
    if (currentChatId) {
      const uiState = {
        preferencesShown,
        showDestinations,
        showSummaryConfirmation,
        isVibeExpanded
      };
      sessionStorage.setItem(`ui_state_${currentChatId}`, JSON.stringify(uiState));
    }
  }, [preferencesShown, showDestinations, showSummaryConfirmation, isVibeExpanded, currentChatId]);

  // Utilities: normalize natural date strings and compute duration
  const normalizeDateString = (value) => {
    if (!value) return "";
    const months = {
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };
    const parts = value
      .toLowerCase()
      .replace(/(st|nd|rd|th)/g, "")
      .trim()
      .split(/\s+/);
    if (parts.length < 2) return "";
    const day = parts[0].padStart(2, "0");
    const month = months[parts[1].slice(0, 3)] || "";
    const year = parts[2] || String(new Date().getFullYear());
    if (!month) return "";
    return `${year}-${month}-${day}`;
  };

  const computeDurationFromDates = (start, end) => {
    const s = normalizeDateString(start);
    const e = normalizeDateString(end);
    if (!s || !e) return "";
    const sd = new Date(s);
    const ed = new Date(e);
    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) return "";
    const ms = Math.max(ed.getTime() - sd.getTime(), 0);
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24)) || 0;
    return `${days} days`;
  };

  // Simplified trip context - only essential info
  const [tripContext, setTripContext] = useState({
    destination: "",
    startLocation: "",
    startDate: "",
    endDate: "",
    duration: "",
    travelers: 0,
    isComplete: false,
  });

  // Initialize Gemini on component mount
  useEffect(() => {
    const initGemini = async () => {
      try {
        const initialized = await initializeGemini();
        setIsGeminiInitialized(initialized);
        
        if (initialized) {
          // Load persisted context for this chat
          try {
            const chatKey = `tripContext_${currentChatId}`;
            const persisted = sessionStorage.getItem(chatKey);
            if (persisted) {
              setTripContext(JSON.parse(persisted));
            }
            
            // Load messages for this chat
            const messagesKey = `messages_${currentChatId}`;
            const persistedMessages = sessionStorage.getItem(messagesKey);
            if (persistedMessages) {
              setMessages(JSON.parse(persistedMessages));
            } else {
              // Check for initial trip description and create contextual greeting
              const initialDescription = localStorage.getItem('initialTripDescription');
              let greeting;
              
              if (initialDescription) {
                greeting = `Great! I see you're interested in: "${initialDescription}"\n\nLet me ask you a few quick questions to plan your perfect trip! 🌟\n\nFirst, which specific destination in India are you most excited about?`;
                localStorage.removeItem('initialTripDescription');
              } else {
                greeting = geminiService.getInitialGreeting();
              }
              
              setMessages([
                { type: "ai", content: greeting, timestamp: new Date() },
              ]);
            }
          } catch {}

        }
      } catch (error) {
        console.error("Failed to initialize Gemini:", error);
        setError("Failed to initialize AI service. Please try again.");
      }
    };

    initGemini();
  }, [currentChatId]);

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
      "goa",
      "kerala",
      "rajasthan",
      "mumbai",
      "delhi",
      "bangalore",
      "chennai",
      "kolkata",
      "jaipur",
      "udaipur",
      "jodhpur",
      "agra",
      "varanasi",
      "rishikesh",
      "manali",
      "shimla",
      "darjeeling",
      "ooty",
      "kodaikanal",
      "munnar",
      "alleppey",
      "kochi",
      "mysore",
      "hampi",
    ];

    for (const dest of indianDestinations) {
      if (lowerMessage.includes(dest)) {
        newContext.destination = dest.charAt(0).toUpperCase() + dest.slice(1);
        break;
      }
    }

    // Extract start location
    const indianCities = [
      "mumbai",
      "delhi",
      "bangalore",
      "chennai",
      "kolkata",
      "hyderabad",
      "pune",
      "ahmedabad",
      "jaipur",
      "surat",
      "lucknow",
      "kochi",
      "chandigarh",
    ];

    for (const city of indianCities) {
      if (lowerMessage.includes(`from ${city}`)) {
        newContext.startLocation = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }

    // Extract dates and duration
    const dateMatch = message.match(
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:\s+\d{4})?)/gi
    );
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
      if (durationMatch[0].includes("week")) {
        newContext.duration = `${num * 7} days`;
      } else if (durationMatch[0].includes("month")) {
        newContext.duration = `${num * 30} days`;
      } else {
        newContext.duration = `${num} days`;
      }
    }

    // Extract number of travelers
    const travelerMatch = message.match(
      /(\d+)\s*(?:people|persons?|travelers?|friends?|family\s*members?)/i
    );
    if (travelerMatch) {
      newContext.travelers = parseInt(travelerMatch[1]);
    } else if (
      lowerMessage.includes("solo") ||
      lowerMessage.includes("alone") ||
      lowerMessage.includes("just me")
    ) {
      newContext.travelers = 1;
    } else if (
      lowerMessage.includes("couple") ||
      lowerMessage.includes("two of us")
    ) {
      newContext.travelers = 2;
    }

    // Persist on every extraction for this specific chat
    try {
      const chatKey = `tripContext_${currentChatId}`;
      sessionStorage.setItem(chatKey, JSON.stringify(newContext));
    } catch {}

    return newContext;
  };

  // Process message and handle conversation flow
  const processMessage = async (message) => {
    if (!isGeminiInitialized) {
      throw new Error("Gemini AI is not initialized");
    }

    try {
      // Send message to Gemini with full conversation history
      setIsThinking(true);
      const aiResponse = await sendMessageToGemini(message, tripContext, messages);

      // Extract information from user's message
      const updatedContext = extractTripInfo(message, tripContext);
      setTripContext(updatedContext);

      // Check if all essential information is collected
      const hasAllInfo = updatedContext.destination && 
                        updatedContext.startLocation && 
                        (updatedContext.startDate || updatedContext.duration) && 
                        updatedContext.travelers > 0;

      // If Gemini indicates all information is collected or we have all info, show confirmation
      if (
        aiResponse
          .toLowerCase()
          .includes("let me show you a summary for confirmation") ||
        hasAllInfo
      ) {
        updatedContext.isComplete = true;
        setTripContext(updatedContext);

        // Show summary confirmation
        setShowSummaryConfirmation(true);

        try {
          const chatKey = `tripContext_${currentChatId}`;
          sessionStorage.setItem(chatKey, JSON.stringify(updatedContext));
        } catch {}

        // Ensure duration is computed if dates are present
        if (
          !updatedContext.duration &&
          updatedContext.startDate &&
          updatedContext.endDate
        ) {
          const computed = computeDurationFromDates(
            updatedContext.startDate,
            updatedContext.endDate
          );
          if (computed) {
            updatedContext.duration = computed;
            try {
              const chatKey = `tripContext_${currentChatId}`;
              sessionStorage.setItem(chatKey, JSON.stringify(updatedContext));
            } catch {}
            setTripContext({ ...updatedContext });
          }
        }

        // Persist a concise trip plan for later use (destination for API keys, etc.)
        try {
          const tripPlan = {
            chatId: currentChatId,
            destination: updatedContext.destination || "",
            startLocation: updatedContext.startLocation || "",
            startDate: updatedContext.startDate || "",
            endDate: updatedContext.endDate || "",
            duration: updatedContext.duration || "",
            travelers: updatedContext.travelers || 0,
            createdAt: new Date().toISOString(),
          };
          sessionStorage.setItem(`tripPlan_${currentChatId}`, JSON.stringify(tripPlan));
        } catch {}

        // Preferences will only be shown when user clicks Continue in confirmation dialog
        // Removed automatic preferences showing for better UX control
      }

      return aiResponse;
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isGeminiInitialized) return;

    const userMessage = {
      type: "user",
      content: newMessage,
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Persist messages for this chat
    try {
      const messagesKey = `messages_${currentChatId}`;
      sessionStorage.setItem(messagesKey, JSON.stringify(updatedMessages));
    } catch {}

    const messageContent = newMessage;
    setNewMessage("");
    setIsTyping(true);
    setError(null);
    setHasUserInteracted(true);

    try {
      const aiResponse = await processMessage(messageContent);
      setTimeout(() => {
        const finalMessages = [
          ...updatedMessages,
          {
            type: "ai",
            content: aiResponse,
            timestamp: new Date(),
          },
        ];
        setMessages(finalMessages);
        
        // Persist updated messages
        try {
          const messagesKey = `messages_${currentChatId}`;
          sessionStorage.setItem(messagesKey, JSON.stringify(finalMessages));
        } catch {}
        
        setIsTyping(false);
      }, 800);
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while processing your message"
      );

      setTimeout(() => {
        const finalMessages = [
          ...updatedMessages,
          {
            type: "ai",
            content:
              "Oops! Something went wrong on my end. Mind giving that another shot? 🔄",
            timestamp: new Date(),
          },
        ];
        setMessages(finalMessages);
        
        // Persist updated messages
        try {
          const messagesKey = `messages_${currentChatId}`;
          sessionStorage.setItem(messagesKey, JSON.stringify(finalMessages));
        } catch {}
        
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

  const processItinerary = async (destinations: any[]) => {
    // Here you would integrate with your itinerary generation logic
    // For now, we'll add a placeholder itinerary message
    const itineraryMessage = {
      type: "ai",
      content: `✨ Your personalized itinerary is ready! ✨

${tripContext.duration} in ${tripContext.destination}
🗓️ ${tripContext.startDate} to ${tripContext.endDate}
👥 ${tripContext.travelers} Travelers

Here's your customized journey:
${destinations
  .map(
    (dest, index) => `
Day ${index + 1}-${index + 2}: ${dest.name}
• Explore local attractions and landmarks
• Experience recommended activities
• Discover local cuisine and culture
`
  )
  .join("\n")}

Would you like me to provide more details about any specific destination or day? 🌟`,
      timestamp: new Date(),
    };
    
    const updatedMessages = [...messages, itineraryMessage];
    setMessages(updatedMessages);
    
    // Persist updated messages
    try {
      const messagesKey = `messages_${currentChatId}`;
      sessionStorage.setItem(messagesKey, JSON.stringify(updatedMessages));
    } catch {}
  };

  // Handle completion of preferences selection
  const handlePreferencesComplete = (pickedIds: string[]) => {
    const tripData = {
      chatId: currentChatId,
      destination: tripContext.destination,
      from: tripContext.startLocation,
      startDate: tripContext.startDate,
      endDate: tripContext.endDate,
      duration: tripContext.duration,
      travelers: tripContext.travelers,
      preferences: pickedIds,
    };

    try {
      sessionStorage.setItem(`tripData_${currentChatId}`, JSON.stringify(tripData));
    } catch (e) {
      // SessionStorage not available
    }

    const userMessage = {
      type: "user",
      content: "Perfect! I've selected my preferences!",
      timestamp: new Date(),
    };
    
    const aiMessage = {
      type: "ai",
      content: `🚀 Fantastic choices! Based on your ${pickedIds.length} selected preferences, I can suggest some amazing places in ${tripContext.destination} that you'll love. 

Let's move on to selecting your destinations! I'll help you:
- Pick the best locations that match your interests
- Create an optimal route between places
- Suggest how long to spend at each spot
- Find hidden gems along the way

Ready to map out your adventure? Let's pick your destinations! 🗺️✨`,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage, aiMessage];
    setMessages(updatedMessages);
    
    // Persist updated messages
    try {
      const messagesKey = `messages_${currentChatId}`;
      sessionStorage.setItem(messagesKey, JSON.stringify(updatedMessages));
    } catch {}

    setShowDestinations(true);
    setPreferencesShown(false); // Hide preferences to show PreferencesFolded
  };

  const handleSummaryConfirm = async () => {
    setShowSummaryConfirmation(false);
    
    // Add user confirmation message
    const userMessage = {
      type: "user",
      content: "✅ Perfect! These details look good. Let's continue!",
      timestamp: new Date(),
    };
    
    // Add AI summary message
    const summaryMessage = {
      type: "ai",
      content: `Your Trip Summary

Destination: ${tripContext.destination}
Departure City: ${tripContext.startLocation}  
Duration: ${tripContext.duration || tripContext.startDate}
Number of Travelers: ${tripContext.travelers}

Thank you for providing your travel details. Now let's personalize your experience by selecting your travel preferences. This will help me suggest the most suitable places and activities for your ${tripContext.destination} journey.`,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage, summaryMessage];
    setMessages(updatedMessages);
    
    // Persist updated messages
    try {
      const messagesKey = `messages_${currentChatId}`;
      sessionStorage.setItem(messagesKey, JSON.stringify(updatedMessages));
    } catch {}

    // Show preferences after a brief delay
    setTimeout(() => {
      setPreferencesShown(true);
    }, 1000);
    
    // Generate chat title using Gemini
    try {
      const title = await geminiService.generateChatTitle(tripContext);
    } catch (error) {
      console.error('Failed to generate chat title:', error);
    }
  };

  const handleSummaryEdit = () => {
    setShowSummaryConfirmation(false);
    // User can continue the conversation to edit details
  };

  // Handle trip context updates and re-validate with Gemini
  const handleTripContextUpdate = async (updatedContext) => {
    try {
      // Persist updated context
      const chatKey = `tripContext_${currentChatId}`;
      sessionStorage.setItem(chatKey, JSON.stringify(updatedContext));

      // Check if all essential information is still complete
      const hasAllInfo = updatedContext.destination && 
                        updatedContext.startLocation && 
                        (updatedContext.startDate || updatedContext.duration) && 
                        updatedContext.travelers > 0;

      if (!hasAllInfo) {
        // If information is incomplete, ask Gemini to continue conversation
        const missingInfo = [];
        if (!updatedContext.destination) missingInfo.push('destination');
        if (!updatedContext.startLocation) missingInfo.push('start location');
        if (!updatedContext.startDate && !updatedContext.duration) missingInfo.push('travel dates');
        if (!updatedContext.travelers || updatedContext.travelers <= 0) missingInfo.push('number of travelers');

        const contextMessage = `I've updated my trip details. Here's what I have now: 
${updatedContext.destination ? `Destination: ${updatedContext.destination}` : ''}
${updatedContext.startLocation ? `From: ${updatedContext.startLocation}` : ''}
${updatedContext.duration || updatedContext.startDate ? `Duration: ${updatedContext.duration || updatedContext.startDate}` : ''}
${updatedContext.travelers ? `Travelers: ${updatedContext.travelers}` : ''}

Please help me complete the missing information.`;

        // Hide confirmation dialog and continue conversation
        setShowSummaryConfirmation(false);
        
        // Set the message and send it
        setNewMessage(contextMessage);
        setTimeout(async () => {
          await handleSendMessage();
        }, 100);
      }
    } catch (error) {
      console.error('Error updating trip context:', error);
    }
  };

  // Handle preferences expansion - reopen preferences component
  const handlePreferencesExpand = () => {
    setPreferencesShown(true);
    // Keep destinations visible so user can see real-time updates
    // setShowDestinations(false); // Removed this line
    setShowSummaryConfirmation(false);
  };

  // Update selected preferences and sync with destinations
  const updateSelectedPreferences = (preferences) => {
    setSelectedPreferences(preferences);
    // Save to sessionStorage for real-time sync
    const tripData = JSON.parse(sessionStorage.getItem(`tripData_${currentChatId}`) || '{}');
    tripData.preferences = preferences;
    sessionStorage.setItem(`tripData_${currentChatId}`, JSON.stringify(tripData));
    
    // Save to chat-specific localStorage
    if (currentChatId) {
      localStorage.setItem(`selectedPreferences_${currentChatId}`, JSON.stringify(preferences));
    }
  };

  const handleDestinationsComplete = async (destinations: any[]) => {
    try {
      const finalTripData = {
        ...JSON.parse(sessionStorage.getItem(`tripData_${currentChatId}`) || "{}"),
        finalDestinations: destinations,
      };
      sessionStorage.setItem(`finalTripData_${currentChatId}`, JSON.stringify(finalTripData));
      
      // Generate chat title using Gemini
      let tripTitle = `${tripContext.destination} Trip`;
      try {
        tripTitle = await geminiService.generateChatTitle(tripContext);
      } catch (error) {
        console.error('Failed to generate chat title:', error);
      }
      
      // Save trip to context
      saveTrip({
        chatId: currentChatId,
        title: tripTitle,
        destinations: destinations.map(d => d.name),
        startDate: tripContext.startDate || new Date().toISOString(),
        endDate: tripContext.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        travelers: tripContext.travelers,
        preferences: finalTripData.preferences || [],
        chatData: tripContext, // Store full chat data for future reference
      });
    } catch (e) {
      // SessionStorage not available
    }

    const userMessage = {
      type: "user",
      content: "I've selected my destinations!",
      timestamp: new Date(),
    };
    
    const aiMessage = {
      type: "ai",
      content: `Perfect! I'm now crafting your personalized itinerary for ${tripContext.destination}. I'll help you explore: 🗺️

1. Detailed day-by-day plans for each destination
2. Local attractions and hidden gems
3. Transportation options between locations
4. Recommended activities based on your preferences
5. Local cuisine and dining suggestions

I'm putting all of this together into a comprehensive travel plan. Just give me a moment... ✨`,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage, aiMessage];
    setMessages(updatedMessages);
    
    // Persist updated messages
    try {
      const messagesKey = `messages_${currentChatId}`;
      sessionStorage.setItem(messagesKey, JSON.stringify(updatedMessages));
    } catch {}

    setShowDestinations(false);

    // Add a small delay before showing the processing message
    setTimeout(() => {
      const processingMessage = {
        type: "ai",
        content: `I'm excited to create your personalized itinerary! 🎨 

Here's what I'm planning for each destination:
• Organizing activities based on your interests
• Finding the best local experiences
• Suggesting authentic restaurants and cafes
• Planning optimal routes and travel times
• Adding some flexibility for spontaneous exploration

Your detailed travel plan will be ready in just a moment... 🌟`,
        timestamp: new Date(),
      };
      
      const finalMessages = [...updatedMessages, processingMessage];
      setMessages(finalMessages);
      
      // Persist updated messages
      try {
        const messagesKey = `messages_${currentChatId}`;
        sessionStorage.setItem(messagesKey, JSON.stringify(finalMessages));
      } catch {}

      // This is where you would integrate with your itinerary generation logic
      // For now, we'll simulate processing time
      setTimeout(() => {
        processItinerary(destinations);
      }, 3000);
    }, 1000);
  };

  // Dummy data generation now moved into PreferencesWidget

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-['Inter',sans-serif]">
      <div className="w-full max-w-3xl mx-auto px-4 pt-6">
        <Sidebar />

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="text-red-700 dark:text-red-300 text-sm font-medium">
              {error}
            </div>
          </div>
        )}

        <div className="space-y-8 mb-28">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-3`}>
              {message.type === "ai" ? (
                <div className="flex items-start gap-3 max-w-[92%]">
                  <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">
                      Travion.ai
                    </div>
                    <div className="rounded-none border-0 bg-transparent p-0">
                      <div className="prose dark:prose-invert max-w-none">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: message.content.replace(/\n/g, "<br>"),
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-1 text-slate-400 dark:text-slate-500">
                        <button
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Good response"
                          aria-label="Good response"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Bad response"
                          aria-label="Bad response"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Undo"
                          aria-label="Undo"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 max-w-[92%]">
                  <img
                    src={userAvatar}
                    alt="You"
                    className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      You
                    </div>
                    <div className="p-0">
                      <div className="whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showSummaryConfirmation && (
            <TripConfirmationDialog 
              tripContext={tripContext}
              onConfirm={handleSummaryConfirm}
              onUpdate={(updatedContext) => {
                setTripContext(updatedContext);
                // Re-validate with Gemini if needed
                handleTripContextUpdate(updatedContext);
              }}
            />
          )}

          {preferencesShown &&
            tripContext.destination &&
            !showDestinations && (
              <PreferencesWidget
                destination={tripContext.destination}
                onComplete={handlePreferencesComplete}
                onPreferencesChange={updateSelectedPreferences}
              />
            )}

          {/* Show PreferencesFolded when user is on destinations or beyond, but NOT when preferences are currently shown */}
          {showDestinations && !preferencesShown && (
            <PreferencesFolded 
              preferences={selectedPreferences} 
              onExpand={handlePreferencesExpand}
            />
          )}

          {showDestinations && (
            <div className="mt-4">
              <Destinations
                tripData={{
                  destination: tripContext.destination,
                  startLocation: tripContext.startLocation,
                  duration: tripContext.duration,
                  startDate: tripContext.startDate,
                  endDate: tripContext.endDate,
                  travelers: tripContext.travelers,
                  preferences: selectedPreferences,
                }}
                onComplete={handleDestinationsComplete}
              />
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

          {isThinking && (
            <div className="flex items-center gap-3">
              <div className="flex space-x-2 bg-white dark:bg-slate-800 rounded-lg p-3">
                <div className="w-2 h-2 bg-purple-300 dark:bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-purple-300 dark:bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-purple-300 dark:bg-purple-600 rounded-full animate-bounce"></div>
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
