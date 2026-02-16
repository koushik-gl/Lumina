import { GoogleGenAI } from "@google/genai";
import { Book } from "../types";

const API_KEY = process.env.API_KEY || '';

export const getAIBookInsights = async (books: Book[], query: string): Promise<string> => {
  if (!API_KEY) {
    return "Please configure your API Key to use the AI Librarian features.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Prepare the context from the book list
    const libraryContext = books.map(b => 
      `- "${b.title}" by ${b.author} (${b.year}, ${b.genre}) - Status: ${b.status}, Rating: ${b.rating}/5`
    ).join('\n');

    const prompt = `
      You are an expert Librarian AI. 
      Here is the user's current library:
      ${libraryContext}

      User Query: "${query}"

      Provide a helpful, concise, and insightful response based on their library. 
      If they ask for recommendations, suggest books similar to their high-rated ones.
      If they ask for an analysis, analyze their reading habits.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while communicating with the library AI.";
  }
};
