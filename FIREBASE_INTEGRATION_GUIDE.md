# Firebase Integration Guide for Travion.ai

This guide provides comprehensive instructions for integrating Firebase services into the Travion.ai travel planning application.

## 🎯 Overview

Firebase integration provides:
- **Real-time chat persistence** across devices and sessions
- **User authentication** and profile management
- **Trip data synchronization** in the cloud
- **Offline support** for better user experience
- **Analytics** for user behavior insights

## 🏗️ Current Architecture

### Session-based Storage (Current)
```
├── sessionStorage (per-chat session)
│   ├── messages_{chatId}
│   ├── tripContext_{chatId}
│   └── selectedPreferences_{chatId}
└── localStorage (global preferences)
    └── selectedPreferences
```

### Firebase Architecture (Target)
```
├── Firestore Database
│   ├── users/{userId}
│   ├── chats/{chatId}
│   ├── trips/{tripId}
│   └── preferences/{userId}
├── Firebase Auth
└── Firebase Functions (already implemented)
```

## 📋 Prerequisites

1. **Firebase Project Setup**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

2. **Required Firebase Services**
   - Authentication
   - Firestore Database
   - Cloud Functions (✅ already configured)
   - Hosting (optional)

## 🔧 Implementation Steps

### Step 1: Firebase Configuration

1. **Update Firebase Config** (`src/lib/firebase.ts`)
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
```

2. **Environment Variables** (`.env`)
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
```

### Step 2: Authentication Integration

1. **Create Auth Context** (`src/contexts/AuthContext.tsx`)
```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Implementation methods...
  
  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Step 3: Firestore Data Structure

1. **Chat Documents** (`chats/{chatId}`)
```typescript
interface ChatDocument {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  tripContext: TripContext;
  preferences: string[];
  destinations: PlaceItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'active' | 'completed' | 'archived';
}
```

2. **User Documents** (`users/{userId}`)
```typescript
interface UserDocument {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  defaultPreferences: string[];
  savedTrips: string[];
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
}
```

### Step 4: Real-time Chat Sync

1. **Enhanced Firebase Service** (`src/lib/firebaseService.ts`)
```typescript
import { db } from './firebase';
import { doc, setDoc, getDoc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';

export class FirebaseChatService {
  // Real-time message sync
  subscribeToChat(chatId: string, callback: (chatData: any) => void) {
    const chatRef = doc(db, 'chats', chatId);
    return onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  }

  // Save chat with automatic sync
  async saveChat(chatId: string, chatData: any) {
    const chatRef = doc(db, 'chats', chatId);
    await setDoc(chatRef, {
      ...chatData,
      updatedAt: new Date()
    }, { merge: true });
  }

  // Batch operations for performance
  async batchUpdateMessages(chatId: string, messages: Message[]) {
    // Implementation for efficient message updates
  }
}
```

### Step 5: Offline Support

1. **Enable Offline Persistence**
```typescript
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// Enable offline persistence
export const enableOfflineSupport = async () => {
  try {
    await enableNetwork(db);
  } catch (error) {
    console.error('Offline support error:', error);
  }
};
```

2. **Hybrid Storage Strategy**
```typescript
// Use Firebase when online, fallback to sessionStorage when offline
export const hybridStorage = {
  async saveData(key: string, data: any) {
    try {
      // Try Firebase first
      await firebaseChatService.saveChat(key, data);
    } catch (error) {
      // Fallback to sessionStorage
      sessionStorage.setItem(key, JSON.stringify(data));
    }
  },
  
  async loadData(key: string) {
    try {
      // Try Firebase first
      return await firebaseChatService.getChat(key);
    } catch (error) {
      // Fallback to sessionStorage
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }
  }
};
```

## 🔄 Migration Strategy

### Phase 1: Parallel Implementation
- Keep existing sessionStorage logic
- Add Firebase as secondary storage
- Implement sync between both systems

### Phase 2: Gradual Migration
- New users start with Firebase
- Existing users migrate on next login
- Maintain backward compatibility

### Phase 3: Full Migration
- Remove sessionStorage dependencies
- Firebase becomes primary storage
- Enhanced features (real-time sync, offline support)

## 🛡️ Security Rules

1. **Firestore Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chats are accessible to their owners
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Trips are accessible to their owners
    match /trips/{tripId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 📊 Performance Optimizations

### 1. Efficient Queries
```typescript
// Use pagination for large message lists
const messagesQuery = query(
  collection(db, 'chats', chatId, 'messages'),
  orderBy('timestamp', 'desc'),
  limit(50)
);
```

### 2. Caching Strategy
```typescript
// Implement intelligent caching
const cachedData = new Map();
export const getCachedData = async (key: string) => {
  if (cachedData.has(key)) {
    return cachedData.get(key);
  }
  const data = await fetchFromFirebase(key);
  cachedData.set(key, data);
  return data;
};
```

### 3. Batch Operations
```typescript
// Batch writes for better performance
import { writeBatch } from 'firebase/firestore';

const batch = writeBatch(db);
messages.forEach(message => {
  const messageRef = doc(collection(db, 'chats', chatId, 'messages'));
  batch.set(messageRef, message);
});
await batch.commit();
```

## 🧪 Testing Strategy

### 1. Unit Tests
```typescript
// Test Firebase operations
describe('Firebase Chat Service', () => {
  test('should save chat data', async () => {
    const chatData = { id: 'test', messages: [] };
    await firebaseChatService.saveChat('test', chatData);
    const retrieved = await firebaseChatService.getChat('test');
    expect(retrieved).toEqual(chatData);
  });
});
```

### 2. Integration Tests
```typescript
// Test real-time sync
describe('Real-time Sync', () => {
  test('should sync messages across sessions', async () => {
    // Implementation for testing real-time features
  });
});
```

## 🚀 Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Environment variables set in production
- [ ] Security rules deployed
- [ ] Functions deployed and tested
- [ ] Firestore indexes created
- [ ] Analytics configured
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented

## 🔍 Monitoring & Analytics

### 1. Firebase Analytics
```typescript
import { logEvent } from 'firebase/analytics';

// Track user interactions
export const trackChatStarted = () => {
  logEvent(analytics, 'chat_started', {
    timestamp: new Date().toISOString()
  });
};

export const trackTripCompleted = (tripData: any) => {
  logEvent(analytics, 'trip_completed', {
    destination: tripData.destination,
    duration: tripData.duration,
    travelers: tripData.travelers
  });
};
```

### 2. Performance Monitoring
```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);
// Automatic performance monitoring
```

## 🆘 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check API keys and project configuration
   - Verify authentication domain settings

2. **Firestore Permission Errors**
   - Review security rules
   - Check user authentication status

3. **Offline Sync Issues**
   - Implement proper error handling
   - Test offline scenarios thoroughly

4. **Performance Problems**
   - Optimize queries with proper indexing
   - Implement pagination for large datasets
   - Use caching strategically

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

---

**Note**: This integration can be implemented incrementally without breaking existing functionality. The hybrid storage approach ensures smooth transition and maintains user experience during migration.
