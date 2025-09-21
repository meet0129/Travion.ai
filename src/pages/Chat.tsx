import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Bot,
  User as UserIcon,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Send,
} from "lucide-react";
import userAvatar from "../assets/default-avatar.svg";
import Sidebar from "../components/Sidebar";
import {
  initializeGemini,
  sendMessageToGemini,
  geminiService,
} from "../lib/gemini";
import PreferencesWidget from "../components/PreferencesWidget";
import DestinationSelector from "../components/DestinationSelector";

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);

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
        if (!initialized) {
          setError(
            "Gemini API is not configured. Please add your API key to the .env file."
          );
        }
        if (initialized) {
          // Load persisted context if any
          try {
            const persisted = sessionStorage.getItem("tripContext");
            if (persisted) {
              setTripContext(JSON.parse(persisted));
            }
          } catch {}

          // Show model's initial greeting as first message
          const greeting = geminiService.getInitialGreeting();
          setMessages([
            { type: "ai", content: greeting, timestamp: new Date() },
          ]);
        }
      } catch (error) {
        console.error("Failed to initialize Gemini:", error);
        setError("Failed to initialize AI service. Please try again.");
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

    // Persist on every extraction
    try {
      sessionStorage.setItem("tripContext", JSON.stringify(newContext));
    } catch {}

    return newContext;
  };

  // Process message and handle conversation flow
  const processMessage = async (message) => {
    if (!isGeminiInitialized) {
      throw new Error("Gemini AI is not initialized");
    }

    try {
      // Send message to Gemini and get response
      const aiResponse = await sendMessageToGemini(message, tripContext);

      // Extract information from user's message
      const updatedContext = extractTripInfo(message, tripContext);
      setTripContext(updatedContext);

      // If Gemini indicates all information is collected, show preferences after the response
      if (
        aiResponse
          .toLowerCase()
          .includes("let's move on to your travel preferences")
      ) {
        updatedContext.isComplete = true;
        setTripContext(updatedContext);

        try {
          sessionStorage.setItem("tripContext", JSON.stringify(updatedContext));
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
              sessionStorage.setItem(
                "tripContext",
                JSON.stringify(updatedContext)
              );
            } catch {}
            setTripContext({ ...updatedContext });
          }
        }

        // Persist a concise trip plan for later use (destination for API keys, etc.)
        try {
          const tripPlan = {
            destination: updatedContext.destination || "",
            startLocation: updatedContext.startLocation || "",
            startDate: updatedContext.startDate || "",
            endDate: updatedContext.endDate || "",
            duration: updatedContext.duration || "",
            travelers: updatedContext.travelers || 0,
            createdAt: new Date().toISOString(),
          };
          sessionStorage.setItem("tripPlan", JSON.stringify(tripPlan));
        } catch {}

        // Set flag to show preferences after the AI response is displayed
        setTimeout(() => {
          setPreferencesShown(true);
        }, 2000); // Wait 2 seconds after the AI response appears
      }

      return aiResponse;
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isGeminiInitialized) return;

    const userMessage = {
      type: "user",
      content: newMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const messageContent = newMessage;
    setNewMessage("");
    setIsTyping(true);
    setError(null);
    setHasUserInteracted(true);

    try {
      const aiResponse = await processMessage(messageContent);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content: aiResponse,
            timestamp: new Date(),
          },
        ]);
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
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content:
              "Oops! Something went wrong on my end. Mind giving that another shot? 🔄",
            timestamp: new Date(),
          },
        ]);
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

  const [showDestinationSelector, setShowDestinationSelector] = useState(false);

  const processItinerary = async (destinations: any[]) => {
    // Here you would integrate with your itinerary generation logic
    // For now, we'll add a placeholder itinerary message
    setMessages((prev) => [
      ...prev,
      {
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
      },
    ]);
  };

  // Handle completion of preferences selection
  const handlePreferencesComplete = (pickedIds: string[]) => {
    const tripData = {
      destination: tripContext.destination,
      from: tripContext.startLocation,
      startDate: tripContext.startDate,
      endDate: tripContext.endDate,
      duration: tripContext.duration,
      travelers: tripContext.travelers,
      preferences: pickedIds,
    };

    try {
      sessionStorage.setItem("tripData", JSON.stringify(tripData));
    } catch (e) {
      console.log("SessionStorage not available");
    }

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: "Perfect! I've selected my preferences!",
        timestamp: new Date(),
      },
      {
        type: "ai",
        content: `🚀 Fantastic choices! Based on your ${pickedIds.length} selected preferences, I can suggest some amazing places in ${tripContext.destination} that you'll love. 

Let's move on to selecting your destinations! I'll help you:
- Pick the best locations that match your interests
- Create an optimal route between places
- Suggest how long to spend at each spot
- Find hidden gems along the way

Ready to map out your adventure? Let's pick your destinations! 🗺️✨`,
        timestamp: new Date(),
      },
    ]);

    setShowDestinationSelector(true);
  };

  const handleDestinationsComplete = (destinations: any[]) => {
    try {
      const finalTripData = {
        ...JSON.parse(sessionStorage.getItem("tripData") || "{}"),
        finalDestinations: destinations,
      };
      sessionStorage.setItem("finalTripData", JSON.stringify(finalTripData));
    } catch (e) {
      console.log("SessionStorage not available");
    }

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: "I've selected my destinations!",
        timestamp: new Date(),
      },
      {
        type: "ai",
        content: `Perfect! I'm now crafting your personalized itinerary for ${tripContext.destination}. I'll help you explore: 🗺️

1. Detailed day-by-day plans for each destination
2. Local attractions and hidden gems
3. Transportation options between locations
4. Recommended activities based on your preferences
5. Local cuisine and dining suggestions

I'm putting all of this together into a comprehensive travel plan. Just give me a moment... ✨`,
        timestamp: new Date(),
      },
    ]);

    setShowDestinationSelector(false);

    // Add a small delay before showing the processing message
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
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
        },
      ]);

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

          {preferencesShown &&
            tripContext.destination &&
            !showDestinationSelector && (
              <PreferencesWidget
                destination={tripContext.destination}
                onComplete={handlePreferencesComplete}
              />
            )}

          {showDestinationSelector && (
            <div className="mt-4">
              <DestinationSelector
                tripData={{
                  destination: tripContext.destination,
                  from: tripContext.startLocation,
                  duration: tripContext.duration,
                  travelTime: tripContext.startDate,
                  travelers: tripContext.travelers,
                  preferences:
                    JSON.parse(sessionStorage.getItem("tripData") || "{}")
                      .preferences || [],
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
