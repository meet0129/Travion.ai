// Test Firebase configuration
import { auth } from './firebase';

export function testFirebaseConfig() {
  try {
    // Check if auth is properly initialized
    if (auth) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

// Auto-run test when imported (silent)
if (typeof window !== 'undefined') {
  testFirebaseConfig();
}
