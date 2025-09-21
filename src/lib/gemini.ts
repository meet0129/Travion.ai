import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI with fallback
let ai: GoogleGenAI | null = null;

try {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    ai = new GoogleGenAI({ apiKey });
  } else {
    // Gemini API key not found. Using fallback responses.
  }
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error);
}

// Enhanced system prompt for the specialized AI travel agent
const SYSTEM_PROMPT = `You are Travion.ai, a specialized AI travel agent for Indian destinations. Your role is to efficiently collect essential trip information through intelligent conversation tracking.

CORE PERSONALITY:
- Professional yet warm and enthusiastic
- Concise responses (1-2 sentences max)
- Use strategic emojis for engagement
- Memory-focused: always reference previous inputs

ESSENTIAL INFORMATION COLLECTION:
1. Destination (Indian cities/states/regions only)
2. Start Location (departure city)
3. Travel Dates (start date + duration OR start + end date)
4. Number of Travelers (minimum 1)

ADVANCED CONVERSATION RULES:
1. MEMORY FIRST: Always analyze ALL previous messages before responding
2. EXTRACT EVERYTHING: Capture all information from each user message
3. ACKNOWLEDGE PROGRESS: Reference what you already know
4. ONE QUESTION AT A TIME: Ask only ONE specific question per response
5. SMART QUESTIONING: Only ask for genuinely missing information
6. BATCH PROCESSING: If user provides multiple details, acknowledge all
7. COMPLETION DETECTION: When all 4 essentials are collected, trigger confirmation

INTELLIGENT RESPONSE PATTERNS:
- If 0 essentials known: Ask for destination only
- If 1 essential known: Ask for the next missing piece one at a time
- If 2 essentials known: Ask for the next missing piece one at a time
- If 3 essentials known: Ask for the last missing piece one at a time
- If all 4 essentials known: "Perfect! Let me confirm your trip details..."

QUESTION PRIORITY ORDER:
1. Destination (if missing)
2. Start Location (if missing)
3. Duration (if missing)
4. Travelers (if missing)

INFORMATION EXTRACTION INTELLIGENCE:
- Destinations: Mumbai, Goa, Kerala, Rajasthan, etc.
- Start Locations: "from Delhi", "starting from Bangalore"
- Dates: "15th December", "next month", "January 2024"
- Duration: "5 days", "a week", "2 weeks"
- Travelers: "solo", "couple", "family of 4", numbers

VALIDATION RULES:
- Destinations must be in India
- Dates cannot be in the past
- Duration: 1-90 days
- Travelers: 1+ people

MEMORY-ENHANCED EXAMPLES:
User: "Want to visit Goa"
You: "Goa sounds amazing! 🏖️ Which city will you be traveling from?"

User: "From Mumbai, planning for 5 days"
You: "Perfect! Mumbai to Goa for 5 days. 🚗 How many travelers will be joining this trip?"

User: "Just me and my partner"
You: "Excellent! I have all the details - Mumbai to Goa, 5 days, 2 travelers. Let me confirm everything with you! ✨"

COMPLETION TRIGGER:
When all 4 essentials are collected, respond with: "Perfect! I have all your essential trip details. Let me show you a summary for confirmation! 📋"`

// Function to extract trip information from user messages
function extractTripInfo(userMessage: string, currentContext: any): any {
  const lowerMessage = userMessage.toLowerCase();
  const extracted: any = {};

  // Extract destination (Indian cities/states)
  const indianDestinations = [
    'mumbai', 'delhi', 'bangalore', 'hyderabad', 'ahmedabad', 'chennai', 'kolkata', 'pune', 'jaipur', 'lucknow',
    'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri', 'patna', 'vadodara', 'ghaziabad',
    'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'kalyan', 'vasai', 'varanasi', 'srinagar',
    'aurangabad', 'navi mumbai', 'solapur', 'vijayawada', 'kolhapur', 'amritsar', 'noida', 'ranchi', 'howrah',
    'coimbatore', 'raipur', 'jabalpur', 'gwalior', 'chandigarh', 'tiruchirappalli', 'mysore', 'mangalore', 'kochi',
    'goa', 'manali', 'shimla', 'darjeeling', 'ooty', 'munnar', 'kodaikanal', 'alleppey', 'kerala', 'rajasthan',
    'karnataka', 'tamil nadu', 'maharashtra', 'gujarat', 'west bengal', 'punjab', 'haryana', 'himachal pradesh',
    'uttarakhand', 'jammu and kashmir', 'assam', 'odisha', 'bihar', 'madhya pradesh', 'chhattisgarh', 'jharkhand'
  ];

  // Check for destination
  if (!currentContext?.destination) {
    for (const dest of indianDestinations) {
      if (lowerMessage.includes(dest)) {
        extracted.destination = dest.charAt(0).toUpperCase() + dest.slice(1);
        break;
      }
    }
  }

  // Extract start location (cities)
  if (!currentContext?.startLocation) {
    // Look for "from" keyword first
    const fromMatch = lowerMessage.match(/from\s+([a-zA-Z\s]+)/i);
    if (fromMatch) {
      const fromCity = fromMatch[1].trim().toLowerCase();
      for (const dest of indianDestinations) {
        if (fromCity.includes(dest)) {
          extracted.startLocation = dest.charAt(0).toUpperCase() + dest.slice(1);
          break;
        }
      }
    } else {
      // Fallback to general city detection
      for (const dest of indianDestinations) {
        if (lowerMessage.includes(dest) && !extracted.destination) {
          extracted.startLocation = dest.charAt(0).toUpperCase() + dest.slice(1);
          break;
        } else if (lowerMessage.includes(dest) && extracted.destination && dest !== extracted.destination.toLowerCase()) {
          extracted.startLocation = dest.charAt(0).toUpperCase() + dest.slice(1);
          break;
        }
      }
    }
  }

  // Extract travelers (numbers) - only if we already have duration
  if (!currentContext?.travelers) {
    // First check for explicit traveler keywords
    const travelerMatch = lowerMessage.match(/(\d+)\s*(?:people|travelers|persons|guests|members|adults|kids|children|family|group|solo|alone|couple|pair)/i);
    if (travelerMatch) {
      extracted.travelers = parseInt(travelerMatch[1]);
    } 
    // Check for special cases
    else if (lowerMessage.includes('solo') || lowerMessage.includes('alone')) {
      extracted.travelers = 1;
    }
    else if (lowerMessage.includes('couple') || lowerMessage.includes('pair')) {
      extracted.travelers = 2;
    }
    else if (lowerMessage.includes('family')) {
      // Default family size if no number specified
      const familyNumberMatch = lowerMessage.match(/(\d+)\s*family/i);
      if (familyNumberMatch) {
        extracted.travelers = parseInt(familyNumberMatch[1]);
      } else {
        extracted.travelers = 4; // Default family size
      }
    }
    else {
      // Only extract travelers if we already have duration and no duration context in this message
      const hasDurationInMessage = lowerMessage.match(/(\d+)\s*(?:days?|nights?|weeks?|months?)/i);
      const hasDurationInContext = currentContext?.duration || currentContext?.startDate;
      
      if (hasDurationInContext && !hasDurationInMessage) {
        // Look for standalone numbers (only if it's a reasonable number)
        const numberMatch = lowerMessage.match(/\b(\d+)\b/);
        if (numberMatch && parseInt(numberMatch[1]) <= 20 && parseInt(numberMatch[1]) >= 1) {
          // Only extract as travelers if we have all other info (destination, start location, duration)
          const hasAllOtherInfo = currentContext?.destination && currentContext?.startLocation && hasDurationInContext;
          if (hasAllOtherInfo) {
            extracted.travelers = parseInt(numberMatch[1]);
          }
        }
      }
    }
  }

  // Extract duration
  if (!currentContext?.duration && !currentContext?.startDate) {
    const durationMatch = lowerMessage.match(/(\d+)\s*(?:days?|nights?|weeks?|months?)/i);
    if (durationMatch) {
      const num = parseInt(durationMatch[1]);
      const unit = durationMatch[0].toLowerCase().includes('week') ? 'weeks' : 
                   durationMatch[0].toLowerCase().includes('month') ? 'months' : 'days';
      extracted.duration = `${num} ${unit}`;
    } else {
      // If we're asking for duration and user gives just a number, assume it's days
      const numberMatch = lowerMessage.match(/\b(\d+)\b/);
      if (numberMatch && parseInt(numberMatch[1]) <= 90 && parseInt(numberMatch[1]) >= 1) {
        // Check if the conversation context suggests we're asking for duration
        // We have destination and start location, but no duration yet
        const isAskingForDuration = currentContext?.destination && currentContext?.startLocation && !currentContext?.duration;
        if (isAskingForDuration) {
          extracted.duration = `${parseInt(numberMatch[1])} days`;
        }
      }
    }
  }

  // Extract dates
  if (!currentContext?.startDate && !currentContext?.duration) {
    // Tomorrow
    if (lowerMessage.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      extracted.startDate = tomorrow.toISOString().split('T')[0];
    }
    // Next week/month
    else if (lowerMessage.includes('next week')) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      extracted.startDate = nextWeek.toISOString().split('T')[0];
    }
    else if (lowerMessage.includes('next month')) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      extracted.startDate = nextMonth.toISOString().split('T')[0];
    }
  }

  return extracted;
}

class GeminiService {
  private conversationHistory: Array<{ role: 'user' | 'model', content: string }> = [];

  // Initialize the service
  async initialize(): Promise<void> {
    try {
      // Add initial system message to conversation
      this.conversationHistory = [
        {
          role: 'user',
          content: SYSTEM_PROMPT
        },
        {
          role: 'model',
          content: "Hey there! 🌟 Let's plan your Indian getaway. Which destination in India are you thinking about first?"
        }
      ];
      
      // Service initialized
    } catch (error) {
      console.error('Error initializing Gemini service:', error);
      throw new Error('Failed to initialize Gemini service');
    }
  }

  // Send a message to Gemini with trip context awareness
  async sendMessage(userMessage: string, tripContext?: any, previousMessages?: any[]): Promise<any> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // If Gemini AI is not available, use fallback responses
      if (!ai) {
        return this.getFallbackResponse(userMessage, tripContext);
      }

      // Build context-aware conversation history (dedupe and compress)
      let conversationHistory = [...this.conversationHistory];
      
      // Add previous messages if provided for context awareness
      if (previousMessages && previousMessages.length > 0) {
        const previousConversation = previousMessages.map(msg => ({
          role: (msg.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          content: String(msg.text || msg.content || '')
        }));
        conversationHistory = [...previousConversation, ...conversationHistory];
      }

      // Check if this is a greeting or casual message
      const lowerMessage = userMessage.toLowerCase();
      const isGreeting = lowerMessage.includes('hello') || lowerMessage.includes('hi') || 
                        lowerMessage.includes('hey') || lowerMessage.includes('good morning') ||
                        lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening');
      
      // Extract information from user message
      const extractedInfo = extractTripInfo(userMessage, tripContext);
      
      // Update trip context with extracted information
      const updatedTripContext = {
        ...tripContext,
        ...extractedInfo
      };
      
      // Guidance: ask only missing info
      const needDestination = !updatedTripContext?.destination;
      const needStart = !updatedTripContext?.startLocation;
      const needDates = !(updatedTripContext?.startDate || updatedTripContext?.duration || updatedTripContext?.endDate);
      const needTravelers = !(updatedTripContext?.travelers > 0);
      const haveAll = !needDestination && !needStart && !needDates && !needTravelers;

      let contextualPrompt = `CURRENT CONVERSATION STATE:
Destination: ${updatedTripContext?.destination || 'NOT PROVIDED'}
Start Location: ${updatedTripContext?.startLocation || 'NOT PROVIDED'}
Travel Dates: ${updatedTripContext?.startDate || updatedTripContext?.endDate || updatedTripContext?.duration || 'NOT PROVIDED'}
Travelers: ${updatedTripContext?.travelers || 'NOT PROVIDED'}

LATEST USER MESSAGE: "${userMessage}"

INSTRUCTIONS:`;

      if (isGreeting) {
        contextualPrompt += `
GREETING DETECTED → Respond warmly and naturally, then guide toward trip planning.
- Be friendly and enthusiastic
- Acknowledge the greeting
- Gently steer toward trip planning if no trip details are provided
- If trip details exist, reference them and ask what they'd like to do next`;
      } else if (haveAll) {
        contextualPrompt += `
ALL ESSENTIALS COLLECTED → Respond with completion trigger: "Perfect! I have all your essential trip details. Let me show you a summary for confirmation! 📋"`;
      } else {
        contextualPrompt += `
MISSING ESSENTIALS → Acknowledge what you have, ask for ONE specific missing piece. Reference previous conversation context.
- Ask only ONE question at a time
- Be specific about what you need
- Don't ask multiple questions in one response`;
      }

      contextualPrompt += `

RESPONSE REQUIREMENTS:
- Maximum 2 sentences
- Show awareness of conversation history
- Use appropriate emoji
- Be specific about what you need
- Always respond to user messages, even casual ones`;

      // Build conversation context for the AI (use structured contents API)
      const contents = this.conversationHistory.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [...contents, { role: 'user', parts: [{ text: contextualPrompt }] }]
      });

      const aiResponse = typeof (response as any).text === 'function' ? (response as any).text() : ((response as any).candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response. Please try again.");

      // Add AI response to conversation history
      this.conversationHistory.push({
        role: 'model',
        content: aiResponse
      });

      // Return both the response and the updated context
      return {
        response: aiResponse,
        updatedContext: updatedTripContext
      };
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      
      // Enhanced error handling
      if (error.message?.includes('API_KEY') || error.message?.includes('apiKey') || error.message?.includes('API key')) {
        throw new Error('Please add your Gemini API key to your .env file as VITE_GEMINI_API_KEY');
      } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
        throw new Error('API quota exceeded. Please try again later.');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      } else if (error.message?.includes('model')) {
        throw new Error('AI model error. Please try again.');
      } else {
        throw new Error('Sorry, I encountered an error. Please try again.');
      }
    }
  }

  // Fallback responses when Gemini API is not available
  private getFallbackResponse(userMessage: string, tripContext?: any): any {
    const lowerMessage = userMessage.toLowerCase();
    
    // Extract information from user message
    const extractedInfo = extractTripInfo(userMessage, tripContext);
    
    // Update trip context with extracted information
    const updatedTripContext = {
      ...tripContext,
      ...extractedInfo
    };
    
    // Check if this is a greeting
    const isGreeting = lowerMessage.includes('hello') || lowerMessage.includes('hi') || 
                      lowerMessage.includes('hey') || lowerMessage.includes('good morning') ||
                      lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening');
    
    // Check if we have all required information
    const hasDestination = updatedTripContext?.destination;
    const hasStartLocation = updatedTripContext?.startLocation;
    const hasDates = updatedTripContext?.startDate || updatedTripContext?.endDate;
    const hasTravelers = updatedTripContext?.travelers > 0;
    const hasDuration = updatedTripContext?.duration;

    // Handle greetings
    if (isGreeting) {
      if (hasDestination && hasStartLocation && (hasDates || hasDuration) && hasTravelers) {
        return {
          response: `Hello! 👋 Great to see you again! I have all your trip details for ${updatedTripContext.destination}. What would you like to do next?`,
          updatedContext: updatedTripContext
        };
      } else if (hasDestination) {
        return {
          response: `Hi there! 😊 I see you're planning a trip to ${updatedTripContext.destination}. Let me help you complete the details!`,
          updatedContext: updatedTripContext
        };
      } else {
        return {
          response: "Hello! 🌟 Welcome to Travion.ai! I'm here to help you plan the perfect Indian getaway. Which destination are you dreaming of visiting?",
          updatedContext: updatedTripContext
        };
      }
    }

    // If we have all essential info, trigger confirmation
    if (hasDestination && hasStartLocation && (hasDates || hasDuration) && hasTravelers) {
      return {
        response: "Perfect! I have all your essential trip details. Let me show you a summary for confirmation! 📋",
        updatedContext: updatedTripContext
      };
    }

    // Determine what information is still needed
    if (!hasDestination) {
      return {
        response: "Hey there! 🌟 Let's plan your Indian getaway. Which destination in India are you thinking about first?",
        updatedContext: updatedTripContext
      };
    }
    
    if (!hasStartLocation) {
      return {
        response: `Great choice! ${updatedTripContext.destination} is amazing! Which city will you be starting your journey from? 🚀`,
        updatedContext: updatedTripContext
      };
    }
    
    if (!hasDates && !hasDuration) {
      return {
        response: `Perfect! So you're planning to visit ${updatedTripContext.destination} from ${updatedTripContext.startLocation}. For how many days will you be traveling? 📅`,
        updatedContext: updatedTripContext
      };
    }
    
    if (!hasTravelers) {
      return {
        response: `Great! So you're planning a ${updatedTripContext.duration || 'trip'} to ${updatedTripContext.destination} from ${updatedTripContext.startLocation}. How many people will be joining you? 👥`,
        updatedContext: updatedTripContext
      };
    }

    // Default response
    return {
      response: "That sounds amazing! Tell me more about your travel plans and I'll help you create the perfect itinerary! ✨",
      updatedContext: updatedTripContext
    };
  }

  // Get chat history
  getChatHistory(): Array<{ role: 'user' | 'model', content: string }> {
    return this.conversationHistory;
  }

  // Get initial assistant greeting
  getInitialGreeting(): string {
    const firstModel = this.conversationHistory.find((m) => m.role === 'model');
    return firstModel?.content || "Hello! Where would you like to travel in India?";
  }

  // Reset chat session
  resetChat(): void {
    this.conversationHistory = [
      {
        role: 'user',
        content: SYSTEM_PROMPT
      },
      {
        role: 'model',
        content: "Hey there! 🌟 Where's your next adventure taking you? Just tell me your travel dreams and I'll craft the perfect Indian getaway for you!"
      }
    ];
  }

  // Check if API key is configured
  isConfigured(): boolean {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    return !!(apiKey && apiKey.length > 0 && apiKey !== '');
  }

  // Get current trip context summary
  getTripSummary(tripContext: any): string {
    const parts = [];
    if (tripContext.destination) parts.push(tripContext.destination);
    if (tripContext.startDate) parts.push(tripContext.startDate);
    if (tripContext.travelers > 0) parts.push(`${tripContext.travelers} travelers`);
    if (tripContext.duration) parts.push(tripContext.duration);
    
    return parts.length > 0 ? parts.join(' • ') : 'Planning your trip...';
  }

  // Generate chat title based on conversation data
  async generateChatTitle(chatData: any): Promise<string> {
    if (!ai) {
      // Fallback title generation
      const destination = chatData.destination || 'India';
      const travelers = chatData.travelers || 1;
      const duration = chatData.duration || 'trip';
      return `${destination} ${duration} for ${travelers} traveler${travelers > 1 ? 's' : ''}`;
    }

    try {
      let prompt = `Based on this travel conversation, create a short, descriptive title (max 6 words) for this chat:`;

      // If we have chat summary, use it for better context
      if (chatData.chatSummary) {
        prompt += `\n\nConversation Summary:\n${chatData.chatSummary}`;
      } else {
        // Fallback to basic trip data
        prompt += `\n\nTrip Details:
Destination: ${chatData.destination || 'Not specified'}
Start Location: ${chatData.startLocation || 'Not specified'}
Duration: ${chatData.duration || 'Not specified'}
Travelers: ${chatData.travelers || 'Not specified'}
Budget: ${chatData.budget || 'Not specified'}`;
      }

      prompt += `\n\nCreate a concise, engaging title that captures the essence of this trip planning conversation. Examples: "Manali Adventure for 5", "Goa Beach Trip", "Rajasthan Family Journey", "Weekend Getaway to Shimla"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const title = typeof (response as any).text === 'function' ? (response as any).text() : ((response as any).candidates?.[0]?.content?.parts?.[0]?.text || `${chatData.destination || 'India'} Trip`);
      
      // Clean up the title (remove quotes, extra spaces, etc.)
      const cleanTitle = title.replace(/['"]/g, '').trim();
      return cleanTitle || `${chatData.destination || 'India'} Trip`;
    } catch (error) {
      console.error('Failed to generate chat title:', error);
      // Fallback title
      const destination = chatData.destination || 'India';
      const travelers = chatData.travelers || 1;
      return `${destination} Trip for ${travelers}`;
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();

// Export utility functions
export const initializeGemini = async (): Promise<boolean> => {
  try {
    await geminiService.initialize();
    
    if (!geminiService.isConfigured()) {
      console.warn('⚠️ Gemini API key not configured. Using fallback responses. Add VITE_GEMINI_API_KEY to your .env file for full AI functionality.');
    }
    
    return true; // Always return true to allow the app to work with fallback responses
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
    return false;
  }
};

export const sendMessageToGemini = async (message: string, tripContext?: any, previousMessages?: any[]): Promise<any> => {
  return await geminiService.sendMessage(message, tripContext, previousMessages);
};

export default geminiService;