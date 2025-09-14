import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || ''
});

// Enhanced system prompt for the optimized AI travel agent
const SYSTEM_PROMPT = `You are Travion, a smart AI travel agent specializing in Indian destinations. Your goal is to efficiently collect essential trip information and plan personalized vacations.

CORE PERSONALITY:
- Be conversational, friendly, and enthusiastic but concise
- Keep responses short (2-3 sentences max) unless providing detailed recommendations
- Use a cool, professional tone with occasional emojis
- Always stay focused on trip planning

ESSENTIAL INFORMATION TO COLLECT:
1. Destination (where in India)
2. Travel dates/timeframe (when)
3. Number of travelers (how many people)
4. Trip duration (how many days/weeks)

SMART CONVERSATION RULES:
1. EXTRACT multiple pieces of information from each user message when possible
2. NEVER ask for information the user has already provided
3. Only ask for missing essential information
4. Keep questions natural and conversational
5. Once you have all 4 essential details, stop asking and suggest moving to preferences

RESPONSE GUIDELINES:
- Maximum 2-3 sentences per response
- Ask only ONE question at a time if needed
- If user provides multiple details, acknowledge all and ask for what's still missing
- Be smart about extracting info from context (e.g., "solo trip" = 1 traveler)
- Focus on Indian destinations only

EXAMPLE FLOW:
User: "I want to go to Goa with 3 friends next month"
You: "Goa sounds amazing! How many days are you planning for this trip with your friends?"

User: "Planning a solo trip to Kerala for a week"
You: "Perfect! A week in Kerala will be incredible. When are you thinking of traveling?"

Once you have destination, dates, travelers, and duration - immediately suggest moving to preferences instead of asking more questions.

NEVER provide long explanations or travel guides unless specifically asked. Keep it snappy and efficient!`

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
          content: "Hey there! 🌟 Where's your next adventure taking you? Just tell me your travel dreams and I'll craft the perfect Indian getaway for you!"
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

      // Build conversation context for the AI
      const conversationContext = this.conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      // Use the new API structure as per your example
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: conversationContext
      });

      const aiResponse = response.text || "I'm sorry, I couldn't generate a response. Please try again.";

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