import { v4 as uuidv4 } from 'uuid';

function testUUIDGeneration() {
  console.log('🧪 Testing UUID generation...');
  
  // Test UUID generation
  const uuid1 = uuidv4();
  const uuid2 = uuidv4();
  
  console.log('Generated UUID 1:', uuid1);
  console.log('Generated UUID 2:', uuid2);
  
  // Verify they are different
  if (uuid1 !== uuid2) {
    console.log('✅ UUIDs are unique');
  } else {
    console.error('❌ UUIDs are not unique');
  }
  
  // Test URL format
  const chatUrl1 = `/chat/${uuid1}`;
  const chatUrl2 = `/chat/${uuid2}`;
  
  console.log('Chat URL 1:', chatUrl1);
  console.log('Chat URL 2:', chatUrl2);
  
  // Verify URL format
  const uuidRegex = /^\/chat\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(chatUrl1) && uuidRegex.test(chatUrl2)) {
    console.log('✅ Chat URLs have correct UUID format');
  } else {
    console.error('❌ Chat URLs do not have correct UUID format');
  }
  
  console.log('✅ UUID test complete');
}

testUUIDGeneration();


