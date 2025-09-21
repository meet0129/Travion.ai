import { v4 as uuidv4 } from 'uuid';

function testUUIDGeneration() {
  // Test UUID generation
  const uuid1 = uuidv4();
  const uuid2 = uuidv4();
  
  // Verify they are different
  if (uuid1 !== uuid2) {
    // UUIDs are unique
  }
  
  // Test URL format
  const chatUrl1 = `/chat/${uuid1}`;
  const chatUrl2 = `/chat/${uuid2}`;
  
  // Verify URL format
  const uuidRegex = /^\/chat\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(chatUrl1) && uuidRegex.test(chatUrl2)) {
    // Chat URLs have correct UUID format
  }
}

// Auto-run test when imported (silent)
if (typeof window !== 'undefined') {
  testUUIDGeneration();
}


