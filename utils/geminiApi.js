import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = [
  'AIzaSyC9Uo6N0-mO_oM9QZXD28hHk0ZB99NZqMY',
  'AIzaSyCtNsBfYETP3yxnUtTHBzKqKZq9HO_yDs8',
  'AIzaSyA4kYuUQCsJprfRXYkwBsh8ZOYngI9vZNo'
];

const callGeminiWithFallback = async (prompt, isJson = true) => {
  for (let i = 0; i < API_KEYS.length; i++) {
    const currentKey = API_KEYS[i];
    
    // Skip if the key is undefined or empty
    if (!currentKey) continue; 

    const genAI = new GoogleGenerativeAI(currentKey);
    
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash", // Using your flagship flash model
        generationConfig: isJson ? { responseMimeType: "application/json" } : {}
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      return isJson ? JSON.parse(text) : text;

    } catch (error) {
      const isQuotaError = error.message?.includes("429") || error.status === 429 || error.message?.includes("quota");
      
      // If it's a quota error and we have another key left, try the next one
      if (isQuotaError && i < API_KEYS.length - 1) {
        console.log(`API Key ${i + 1} limit reached. Switching to API Key ${i + 2}...`);
        continue; 
      }

      // If it's the last key or not a quota error, log and throw
      console.error(`Gemini Error (Key ${i + 1}):`, error);
      if (i === API_KEYS.length - 1) {
        throw new Error("All AI quotas are currently full or request failed.");
      }
    }
  }
};

export const fetchDiscoverSites = async (categories, existingSites = []) => {
  if (!categories || categories.length === 0) return null;

  // The prompt requesting the exact 60-site batch structure
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
    // Call your new robust fallback method
    const data = await callGeminiWithFallback(prompt, true);
    return data;
  } catch (error) {
    console.error("Discover Fetch Error:", error);
    return null;
  }
};