import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

// Set global options for all functions
setGlobalOptions({ maxInstances: 10 });

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyB2edIgTwFyiMxeMdwToxZHJWPSy4qhsjM";
const GOOGLE_PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place";

// Google Weather (fallback to Open-Meteo if key/endpoint not available)
const GOOGLE_WEATHER_API_KEY = process.env.GOOGLE_WEATHER_API_KEY || "";
const GOOGLE_WEATHER_BASE_URL = "https://weather.googleapis.com/v1";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Helper function to make Google Places API calls
async function callGooglePlacesAPI(endpoint: string, params: Record<string, string>): Promise<any> {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error("Google Places API key not configured");
  }

  const url = new URL(`${GOOGLE_PLACES_BASE_URL}${endpoint}`);
  url.searchParams.append("key", GOOGLE_PLACES_API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Helper function to handle CORS
function handleCors(req: any, res: any): boolean {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.set(corsHeaders);
    res.status(204).send("");
    return true;
  }

  // Set CORS headers for all responses
  res.set(corsHeaders);
  return false;
}

// Main places function
export const places = onRequest(async (req, res) => {
  try {
    logger.info("Places function called", {method: req.method, body: req.body});
    
    // Handle CORS
    if (handleCors(req, res)) {
      return;
    }

    // Only accept POST requests
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed. Use POST." });
      return;
    }

    const { action, ...params } = req.body;

    if (!action) {
      res.status(400).json({ error: "Missing action parameter" });
      return;
    }

    let data: any;

    switch (action) {
      case "textsearch": {
        const { query } = params;
        if (!query) {
          res.status(400).json({ error: "Missing query parameter for textsearch" });
          return;
        }

        data = await callGooglePlacesAPI("/textsearch/json", {
          query: query.toString(),
        });
        break;
      }

      case "nearby": {
        const { latitude, longitude, radius, type, keyword } = params;
        
        if (!latitude || !longitude || !radius) {
          res.status(400).json({ error: "Missing required parameters: latitude, longitude, radius" });
          return;
        }

        const nearbyParams: Record<string, string> = {
          location: `${latitude},${longitude}`,
          radius: radius.toString(),
        };

        if (type) {
          nearbyParams.type = type;
        }

        if (keyword) {
          nearbyParams.keyword = keyword;
        }

        data = await callGooglePlacesAPI("/nearbysearch/json", nearbyParams);
        break;
      }

      case "photo": {
        const { photoReference, maxWidth = "400" } = params;
        
        if (!photoReference) {
          res.status(400).json({ error: "Missing photoReference parameter" });
          return;
        }

        // For photos, we return the URL since we can't proxy binary data easily
        const photoUrl = `${GOOGLE_PLACES_BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${encodeURIComponent(photoReference)}&key=${GOOGLE_PLACES_API_KEY}`;
        
        res.json({ data: { photoUrl } });
        return;
      }

      default: {
        res.status(400).json({ error: `Unknown action: ${action}` });
        return;
      }
    }

    // Return the data from Google Places API
    res.json({ data });

  } catch (error) {
    logger.error("Places function error:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Weather function: accepts { latitude, longitude } and proxies to Google Weather API
export const weather = onRequest(async (req, res) => {
  try {
    logger.info("Weather function called", {method: req.method, body: req.body});

    // Handle CORS
    if (handleCors(req, res)) {
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed. Use POST." });
      return;
    }

    const { latitude, longitude } = req.body || {};
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      res.status(400).json({ error: "Missing or invalid latitude/longitude" });
      return;
    }

    if (!GOOGLE_WEATHER_API_KEY) {
      res.status(500).json({ error: "Weather API key not configured" });
      return;
    }

    // Google Weather: timeline for current+forecast
    const url = new URL(`${GOOGLE_WEATHER_BASE_URL}/forecast`);
    url.searchParams.set("location", `${latitude},${longitude}`);
    url.searchParams.set("key", GOOGLE_WEATHER_API_KEY);
    url.searchParams.set("hourly", "temperature_2m,precipitation_probability,relative_humidity_2m,weather_code,wind_speed_10m");
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    res.json({ data });
  } catch (error) {
    logger.error("Weather function error:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});
