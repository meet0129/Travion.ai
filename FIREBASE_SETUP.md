# Firebase Setup Guide

## What You Need to Do to Make Firebase Functional

### 1. Firebase Project Setup

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create a new project** (if you haven't already):
   - Click "Create a project"
   - Enter project name: `travion-ai-bharat-explorer`
   - Enable Google Analytics (optional)
   - Click "Create project"

### 2. Enable Firestore Database

1. **In your Firebase project console**:
   - Go to "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location (choose closest to your users)
   - Click "Done"

### 3. Update Firebase Configuration

1. **Get your Firebase config**:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click "Add app" → Web app (</> icon)
   - Register your app with a nickname
   - Copy the Firebase configuration object

2. **Update your `.env` file** with the correct Firebase config:
```env
VITE_PUBLIC_FIREBASE_API_KEY=your_api_key_here
VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_PUBLIC_FIREBASE_APP_ID=your_app_id
VITE_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Firestore Security Rules (Important!)

1. **Go to Firestore Database → Rules**:
2. **Update the rules** to allow read/write access (for development):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to chats collection
    match /chats/{document} {
      allow read, write: if true; // For development only
    }
  }
}
```

**⚠️ Security Note**: The above rule allows anyone to read/write. For production, implement proper authentication rules.

### 5. Test Firebase Connection

1. **Start your development server**:
```bash
npm run dev
```

2. **Test the functionality**:
   - Create a new trip
   - Select some preferences
   - Check Firebase Console → Firestore Database to see if data is being saved
   - Try clicking on saved trips in "My Trips" to see if they load correctly

### 6. Production Security Rules (Optional)

For production, implement proper authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chats/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Features Implemented

### ✅ Chat Data Persistence
- **Auto-save**: Chats are automatically saved to Firebase when starting new trips
- **Load on click**: Clicking on saved trips loads the exact state where user left off
- **Real-time sync**: Preferences and destinations sync in real-time

### ✅ Preferences Management
- **Expandable preferences**: Shows folded preferences bar when not on preferences component
- **Reopen functionality**: Click "Expand" to reopen preferences from anywhere
- **Real-time updates**: Changes reflect immediately in destinations component

### ✅ Chat History Navigation
- **Resume where left off**: Clicking saved trips restores exact chat state
- **Firebase integration**: All chat data stored in Firestore database
- **Fallback support**: Falls back to sessionStorage if Firebase fails

## Database Structure

The Firebase collection `chats` stores documents with this structure:

```typescript
{
  id: string,           // Document ID (same as chatId)
  chatId: string,       // Unique chat identifier
  title: string,        // AI-generated chat title
  tripContext: object,  // Trip information (destination, dates, etc.)
  messages: array,      // Chat messages history
  preferences: array,   // Selected preferences/places
  destinations: array,  // Selected destinations
  createdAt: string,    // Creation timestamp
  updatedAt: string,    // Last update timestamp
  userId?: string       // User ID (for future authentication)
}
```

## Troubleshooting

### If Firebase connection fails:
1. Check your `.env` file has correct Firebase config
2. Verify Firestore is enabled in Firebase Console
3. Check browser console for error messages
4. Ensure security rules allow read/write access

### If chat data doesn't load:
1. Check Firebase Console → Firestore Database for saved documents
2. Verify the chatId matches between localStorage and Firebase
3. Check browser console for loading errors

The system will gracefully fall back to sessionStorage if Firebase is unavailable, ensuring the app continues to work.


