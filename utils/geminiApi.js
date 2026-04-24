import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = [
  process.env.EXPO_PUBLIC_GEMINI_API_KEY,
];

// Added onLimitReached parameter
const callGeminiWithFallback = async (prompt, isJson = true, userApiKeys = [], onLimitReached = null) => {
  const allKeys = [...API_KEYS, ...userApiKeys].filter(Boolean);

  if (allKeys.length === 0) {
    throw new Error("No API keys available.");
  }

  for (let i = 0; i < allKeys.length; i++) {
    const currentKey = allKeys[i];
    const genAI = new GoogleGenerativeAI(currentKey);
    
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash", 
        generationConfig: isJson ? { responseMimeType: "application/json" } : {}
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      return isJson ? JSON.parse(text) : text;

    } catch (error) {
      const isQuotaError = error.message?.includes("429") || error.status === 429 || error.message?.includes("quota");
      
      if (isQuotaError) {
        // NEW: Tell the app this specific key is exhausted!
        if (onLimitReached) onLimitReached(currentKey);
        
        if (i < allKeys.length - 1) {
          console.log(`API Key ${i + 1} limit reached. Switching to next key...`);
          continue; 
        }
      }

      console.error(`Gemini Error (Key ${i + 1}):`, error);
      if (i === allKeys.length - 1) {
        throw new Error("All AI quotas are currently full or request failed.");
      }
    }
  }
};

// Added onLimitReached parameter here too
export const fetchDiscoverSites = async (categories, existingSites = [], userApiKeys = [], onLimitReached = null) => {
  if (!categories || categories.length === 0) return null;

  const prompt = `
    You are an expert curator of websites, tools, and resources. 
    I need website suggestions for the following categories: ${categories.join(', ')}.
    
    For EACH category, provide exactly 20 highly useful, modern, and real websites.
    ${existingSites.length > 0 ? `DO NOT include any of these sites because the user already has them: ${existingSites.join(', ')}` : ''}
    
    You must return ONLY a valid JSON object where the keys are the exact category names, and the values are arrays of site objects.
    
    Use this exact JSON schema:
    {
      "${categories[0] || 'Category'}": [
        {
          "id": "unique_string_id",
          "title": "Site Name",
          "description": "A crisp, 1-sentence description of what it does.",
          "url": "https://www.example.com"
        }
      ]
    }
  `;

  try {
    // Pass everything down
    const data = await callGeminiWithFallback(prompt, true, userApiKeys, onLimitReached);
    return data;
  } catch (error) {
    console.error("Discover Fetch Error:", error);
    return null;
  }
};