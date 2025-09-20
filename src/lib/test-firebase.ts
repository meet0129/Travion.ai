// Test Firebase configuration
import { auth } from './firebase';

export function testFirebaseConfig() {
  console.log('🧪 Testing Firebase Configuration...');
  
  try {
    // Check if auth is properly initialized
    if (auth) {
      console.log('✅ Firebase Auth initialized successfully');
      console.log('Auth app:', auth.app.name);
      console.log('Auth config:', auth.app.options);
      return true;
    } else {
      console.error('❌ Firebase Auth not initialized');
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  testFirebaseConfig();
}
