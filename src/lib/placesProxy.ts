/*
  Lightweight client for Firebase HTTPS Function proxying Google Places
  - Expects an HTTPS function deployed at: VITE_FIREBASE_FUNCTIONS_URL/places
  - The function should accept JSON { action, ...params } and return { data }
*/

export type ProxyRequest =
  | { action: 'textsearch'; query: string }
  | { action: 'nearby'; latitude: number; longitude: number; radius: number; type?: string; keyword?: string }
  | { action: 'details'; placeId: string }
  | { action: 'photo'; photoReference: string; maxWidth?: number };

export async function callPlacesProxy<T = any>(payload: ProxyRequest): Promise<T> {
  const base = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string | undefined;
  console.log('🔗 PlacesProxy: Making API call', { base: !!base, payload });
  
  if (!base) {
    console.error('❌ VITE_FIREBASE_FUNCTIONS_URL is not configured');
    throw new Error('VITE_FIREBASE_FUNCTIONS_URL is not configured');
  }
  
  const url = `${base.replace(/\/$/, '')}/places`;
  console.log('🌐 PlacesProxy: Calling URL:', url);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    console.log('📡 PlacesProxy: Response status:', res.status);
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('❌ PlacesProxy: API error:', res.status, text);
      throw new Error(`places proxy failed: ${res.status} ${text}`);
    }
    
    const json = await res.json().catch(() => ({}));
    console.log('✅ PlacesProxy: Success response:', json);
    return (json?.data ?? json) as T;
  } catch (error) {
    console.error('❌ PlacesProxy: Network error:', error);
    throw error;
  }
}

// Weather proxy
export async function callWeatherProxy(params: { latitude: number; longitude: number }): Promise<any> {
  const base = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string | undefined;
  if (!base) throw new Error('VITE_FIREBASE_FUNCTIONS_URL is not configured');
  const url = `${base.replace(/\/$/, '')}/weather`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`weather proxy failed: ${res.status} ${text}`);
  }
  const json = await res.json().catch(() => ({}));
  return (json?.data ?? json);
}

// Optional: fetch similar places through the same places proxy
export async function callSimilarPlaces(params: {
  latitude: number; longitude: number; keyword?: string; radius?: number;
}): Promise<any> {
  const base = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string | undefined;
  if (!base) throw new Error('VITE_FIREBASE_FUNCTIONS_URL is not configured');
  const url = `${base.replace(/\/$/, '')}/places`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'nearby', ...params }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`places proxy failed: ${res.status} ${text}`);
  }
  const json = await res.json().catch(() => ({}));
  return (json?.data ?? json);
}


