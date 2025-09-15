# Gemini AI Integration for Travion AI Bharat Explorer

## Overview
This project now includes full integration with Google Gemini AI to provide intelligent, conversational travel planning assistance. The AI agent "Airial" can understand user preferences, ask relevant questions, and provide personalized travel recommendations.

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the project root with the following variables:

```env
# Firebase Configuration (if using Firebase)
VITE_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_PUBLIC_FIREBASE_APP_ID=your_app_id
VITE_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Gemini API Configuration (REQUIRED)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Getting Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env` file as `VITE_GEMINI_API_KEY`

### 3. Install Dependencies
The required package is already installed:
```bash
npm install @google/genai
```

## Features

### 🤖 Intelligent AI Agent
- **Name**: Travion
- **Role**: Personal AI travel agent specializing in Indian destinations
- **Capabilities**: 
  - Natural conversation flow
  - Context-aware responses
  - Progressive data collection
  - Personalized recommendations

### 💬 Chat Interface
- Real-time messaging with AI
- Typing indicators
- Error handling and user feedback
- Responsive design
- Dark/light mode support

### 🔧 Technical Features
- **Conversation Context**: Maintains chat history for better responses
- **Error Handling**: Graceful error management with user-friendly messages
- **Loading States**: Visual feedback during AI processing
- **API Configuration**: Easy environment variable setup
- **TypeScript Support**: Full type safety

## Usage

### Basic Chat Flow
1. User opens the chat page
2. AI greets with introduction message
3. User describes their travel plans
4. AI asks follow-up questions to gather details
5. AI provides personalized recommendations

### Example Conversation
```
User: "I want to visit Goa"
AI: "Goa sounds amazing! Where will you be traveling from?"

User: "Mumbai"
AI: "Perfect! How many days are you planning to stay?"

User: "5 days"
AI: "Great! When are you planning to travel?"

User: "December"
AI: "Excellent timing! How many people will be traveling?"
```

## Customization

### System Prompt
The AI's behavior is controlled by the system prompt in `src/lib/gemini.ts`. You can modify the `SYSTEM_PROMPT` constant to change:
- AI personality
- Response style
- Question flow
- Specialization areas

### AI Configuration
The new Google GenAI SDK uses the `gemini-2.0-flash-exp` model by default. You can modify the model in the `sendMessage` method to use different Gemini models:
- `gemini-2.0-flash-exp`: Latest experimental model
- `gemini-1.5-pro`: Production-ready model
- `gemini-1.5-flash`: Faster, lighter model

## Error Handling

The system handles various error scenarios:
- **API Key Missing**: Clear error message with setup instructions
- **Network Issues**: Retry suggestions and offline fallbacks
- **Rate Limiting**: Quota exceeded notifications
- **Invalid Responses**: Graceful degradation with fallback messages

## File Structure

```
src/
├── lib/
│   ├── gemini.ts          # Gemini AI service
│   └── firebase.ts        # Firebase configuration
├── pages/
│   └── Chat.tsx           # Main chat interface
└── components/
    └── ui/                # UI components
```

## API Integration Details

### Gemini Service (`src/lib/gemini.ts`)
- **Singleton Pattern**: Single instance across the app
- **Chat Session Management**: Maintains conversation context
- **Error Handling**: Comprehensive error management
- **Configuration**: Environment-based setup

### Key Methods
- `initializeGemini()`: Initialize AI service
- `sendMessageToGemini()`: Send user message and get response
- `geminiService.isConfigured()`: Check API key status
- `geminiService.resetChat()`: Reset conversation

## Troubleshooting

### Common Issues

1. **"Gemini API is not configured"**
   - Check if `VITE_GEMINI_API_KEY` is set in `.env`
   - Restart the development server after adding the key

2. **"API quota exceeded"**
   - Check your Gemini API usage limits
   - Wait for quota reset or upgrade your plan

3. **Network errors**
   - Check internet connection
   - Verify API key is valid
   - Check if Gemini API is accessible

### Debug Mode
Enable console logging by checking browser developer tools for detailed error information.

## Security Notes

- API keys are exposed to the client-side (this is normal for Vite apps)
- Consider implementing a backend proxy for production use
- Never commit `.env` files to version control
- Use environment-specific API keys for different deployments

## Future Enhancements

- Backend API proxy for enhanced security
- Conversation persistence across sessions
- Multi-language support
- Voice input/output integration
- Advanced trip planning with booking integration
