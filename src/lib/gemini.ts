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

// Enhanced system prompt for the optimized AI travel agent
const SYSTEM_PROMPT = `You are Travion, a smart AI travel agent specializing in Indian destinations. Your job is to conversationally ask ONLY the essential questions, capture answers, and then hand off to the preferences UI.

CORE PERSONALITY:
- Friendly, enthusiastic, and conversational but professional
- Short, focused responses (2-3 sentences max)
- Use occasional emojis to keep the tone light
- Stay focused on trip planning

ESSENTIAL INFORMATION TO COLLECT (STRICT ORDER):
1. Destination (must be in India)
2. Start Location (city of departure)
3. Dates: either (a) start date + duration OR (b) start date + end date
4. Number of travelers

CONVERSATION RULES:
1. Read and analyze ALL previous messages in the conversation history
2. Extract and remember ALL information provided in each message
3. If user provides multiple pieces of information in one message, acknowledge all of them
4. If ALL required information is provided in one message, immediately proceed to confirmation
5. If some information is missing, ask for the next missing piece
6. Acknowledge each piece of info you collect with brief enthusiasm
7. After collecting ALL required info, immediately reply EXACTLY ONCE with: "Perfect! I have all the essential details. Let's move on to your travel preferences! 🎯"
8. After that message, do not ask any further questions.

INFORMATION EXTRACTION RULES:
- Destination: Any mentioned Indian city/state/region
- Start Location: City they mention traveling from
- Dates: Any date format, including relative ("next month", "December 15th")
- Duration: Any mention of days/weeks/months
- Travelers: Numbers, "solo", "couple", "family of X"

DATA VALIDATION:
- Only accept Indian destinations
- Validate that dates are not in the past
- Duration should be between 1-90 days
- Travelers should be at least 1

EXAMPLES OF GOOD RESPONSES:
User: "Want to visit Goa"
You: "Goa's beaches are calling! Which city will you be starting your journey from? 🌴"

User: "I'm thinking of a Kerala trip from Mumbai next month"
You: "Kerala's backwaters from Mumbai - excellent choice! How many days would you like to spend exploring Kerala? 🌊"

CRITICAL: Once all essential info is collected, immediately transition to preferences mode by indicating completion. Do not ask additional questions after this point.`

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
  async sendMessage(userMessage: string, tripContext?: any, previousMessages?: any[]): Promise<string> {
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

      // Guidance: ask only missing info
      const needDestination = !tripContext?.destination;
      const needStart = !tripContext?.startLocation;
      const needDates = !(tripContext?.startDate || tripContext?.duration || tripContext?.endDate);
      const needTravelers = !(tripContext?.travelers > 0);
      const haveAll = !needDestination && !needStart && !needDates && !needTravelers;

      const contextualPrompt = `Rules:
1) Ask ONLY missing essentials, one concise question at a time.
2) If nothing missing, reply EXACTLY: "Perfect! I have all the essential details. Let's move on to your travel preferences! 🎯"
3) Keep replies under 2 short sentences.

Known info: Destination=${tripContext?.destination || '—'}, Start=${tripContext?.startLocation || '—'}, Dates=${tripContext?.startDate || tripContext?.endDate || tripContext?.duration || '—'}, Travelers=${tripContext?.travelers || '—'}

User: ${userMessage}

${haveAll ? 'All essentials present.' : 'Ask only what is missing.'}`;

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

      return aiResponse;
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
  private getFallbackResponse(userMessage: string, tripContext?: any): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check if we have all required information
    const hasDestination = tripContext?.destination;
    const hasStartLocation = tripContext?.startLocation;
    const hasDates = tripContext?.startDate || tripContext?.endDate;
    const hasTravelers = tripContext?.travelers > 0;
    const hasDuration = tripContext?.duration;

    // If we have all essential info, suggest moving to preferences
    if (hasDestination && hasStartLocation && (hasDates || hasDuration) && hasTravelers) {
      return "Perfect! I have all the essential details. Let's move on to your travel preferences! 🎯";
    }

    // Determine what information is still needed
    if (!hasDestination) {
      return "Hey there! 🌟 Let's plan your Indian getaway. Which destination in India are you thinking about first?";
    }
    
    if (!hasStartLocation) {
      return `Great choice! ${tripContext.destination} is amazing! Which city will you be starting your journey from? 🚀`;
    }
    
    if (!hasDates && !hasDuration) {
      return `Perfect! So you're planning to visit ${tripContext.destination} from ${tripContext.startLocation}. When would you like to travel? You can tell me specific dates or just the duration you're planning! 📅`;
    }
    
    if (!hasTravelers) {
      return `Excellent! So you're planning a trip to ${tripContext.destination} from ${tripContext.startLocation}. How many people will be traveling? 👥`;
    }

    // Default response
    return "That sounds amazing! Tell me more about your travel plans and I'll help you create the perfect itinerary! ✨";
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

export const sendMessageToGemini = async (message: string, tripContext?: any, previousMessages?: any[]): Promise<string> => {
  return await geminiService.sendMessage(message, tripContext, previousMessages);
};

export default geminiService;