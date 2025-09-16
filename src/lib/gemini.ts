import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || ''
});

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
1. Start by asking about their desired destination in India. Do not assume.
2. Extract and remember ALL information provided in each message
3. NEVER ask for information already given
4. Ask ONE question at a time, focusing on the next missing essential info
5. If user mentions BOTH start and end dates, calculate and store duration; do NOT ask for duration
6. If user only gives a start date, ask for duration
7. Acknowledge each piece of info you collect with brief enthusiasm
8. After collecting ALL required info, immediately reply EXACTLY ONCE with: "Perfect! I have all the essential details. Let's move on to your travel preferences! 🎯"
9. After that message, do not ask any further questions.

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
    } catch (error) {
      console.error('Error initializing Gemini service:', error);
      throw new Error('Failed to initialize Gemini service');
    }
  }

  // Send a message to Gemini with trip context awareness
  async sendMessage(userMessage: string, tripContext?: any): Promise<string> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Create context-aware prompt
      let contextualPrompt = userMessage;
      
      if (tripContext) {
        const collectedInfo = [];
        if (tripContext.destination) collectedInfo.push(`Destination: ${tripContext.destination}`);
        if (tripContext.startDate) collectedInfo.push(`Travel time: ${tripContext.startDate}`);
        if (tripContext.travelers > 0) collectedInfo.push(`Travelers: ${tripContext.travelers}`);
        if (tripContext.duration) collectedInfo.push(`Duration: ${tripContext.duration}`);
        
        if (collectedInfo.length > 0) {
          contextualPrompt = `Current trip info: ${collectedInfo.join(', ')}
          
User message: ${userMessage}

Respond based on what information is still needed. If you have all essential info (destination, dates, travelers, duration), suggest moving to preferences.`;
        }
      }

      // Build conversation context for the AI (use structured contents API)
      const contents = this.conversationHistory.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents
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
}

// Export singleton instance
export const geminiService = new GeminiService();

// Export utility functions
export const initializeGemini = async (): Promise<boolean> => {
  try {
    if (!geminiService.isConfigured()) {
      console.warn('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
      return false;
    }
    await geminiService.initialize();
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
    return false;
  }
};

export const sendMessageToGemini = async (message: string, tripContext?: any): Promise<string> => {
  return await geminiService.sendMessage(message, tripContext);
};

export default geminiService;