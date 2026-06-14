
import { GoogleGenAI, GenerateContentResponse, Chat, Part } from "@google/genai";
import { Drone, Alert, Depot, GridCell, AIVerificationResult } from '../types';
import { GEMINI_TEXT_MODEL, GEMINI_VISION_MODEL, MOCK_FIRE_IMAGE_URL, MOCK_NO_FIRE_IMAGE_URL } from '../constants';

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${response.statusText} from ${imageUrl}. Using fallback.`);
      return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]); 
        } else {
          reject(new Error("Failed to read image as base64 string."));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching image as base64:", error);
    return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; 
  }
}


export const getOptimalDroneViaGemini = async (
  ai: GoogleGenAI,
  alert: Alert,
  drones: Drone[],
  depots: Depot[],
  forbiddenZones: { x: number; y: number }[]
): Promise<{ droneId: string | null; reasoning: string }> => {
  const availableDrones = drones.filter(d => d.status === 'IDLE' || d.status === 'PATROLLING');
  if (availableDrones.length === 0) {
    return { droneId: null, reasoning: "No drones available." };
  }

  const prompt = `
    Context: Wildfire response simulation. An alert has been triggered. Select the best drone to investigate.
    Alert Location: (${alert.x}, ${alert.y})
    Forbidden Zones (drones cannot enter or path through): ${JSON.stringify(forbiddenZones)}
    Depots: ${JSON.stringify(depots.map(d => ({id: d.id, x: d.x, y: d.y})))}
    Available Drones:
    ${availableDrones.map(d => 
      `- ID: ${d.id}, Location: (${d.x}, ${d.y}), Battery: ${d.battery}%, Status: ${d.status}, Depot: ${d.depotId}`
    ).join('\n')}

    Task: Evaluate all available drones. Choose ONLY ONE optimal drone to send to the alert location.
    Consider:
    1. Proximity to alert (Euclidean distance is fine for initial sort, but pathfinding matters).
    2. Battery life (must be sufficient for round trip + verification, assume verification takes 10% battery).
    3. Current status (Idle is preferred over Patrolling if distances are similar).
    4. Path availability (drone must be able to reach the alert without passing through forbidden zones). Assume a basic grid pathfinder will be used.

    Output Format: Respond with a JSON object with two keys: "selectedDroneId" (string, ID of the chosen drone, or null if none suitable) and "reasoning" (string, brief explanation for your choice).
    Example: {"selectedDroneId": "D1", "reasoning": "D1 is closest and has sufficient battery."}
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: [{ role: "user", parts: [{text: prompt}] }],
        config: {
            responseMimeType: "application/json",
            temperature: 0.3, 
        }
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const result = JSON.parse(jsonStr) as { selectedDroneId: string | null; reasoning: string };
    
    if (result.selectedDroneId && !availableDrones.some(d => d.id === result.selectedDroneId)) {
        console.warn(`Gemini suggested non-available/invalid drone ID: ${result.selectedDroneId}. Falling back.`);
        const closestDrone = availableDrones.sort((a,b) => 
            Math.hypot(a.x-alert.x, a.y-alert.y) - Math.hypot(b.x-alert.x, b.y-alert.y)
        )[0];
        if (closestDrone) {
            return { droneId: closestDrone.id, reasoning: `Fallback: Gemini suggested invalid drone. Chose ${closestDrone.id} as closest available.`};
        }
        return { droneId: null, reasoning: "Fallback: No suitable drone found after Gemini error." };
    }

    return { droneId: result.selectedDroneId, reasoning: result.reasoning };

  } catch (error) {
    console.error("Error calling Gemini API for drone dispatch:", error);
     const closestDrone = availableDrones.sort((a,b) => 
        Math.hypot(a.x-alert.x, a.y-alert.y) - Math.hypot(b.x-alert.x, b.y-alert.y)
    )[0];
    if (closestDrone) {
        return { droneId: closestDrone.id, reasoning: `Fallback due to API error: Chose ${closestDrone.id} as closest available.`};
    }
    return { droneId: null, reasoning: "Error querying Gemini, and no fallback drone available." };
  }
};


export const verifyFireWithAI = async (
  ai: GoogleGenAI,
  isLikelyFireScene: boolean 
): Promise<AIVerificationResult> => {
  const imageUrl = isLikelyFireScene ? MOCK_FIRE_IMAGE_URL : MOCK_NO_FIRE_IMAGE_URL;
  const imageBase64 = await fetchImageAsBase64(imageUrl);

  const imagePart: Part = {
    inlineData: {
      mimeType: 'image/png', 
      data: imageBase64,
    },
  };

  const textPart: Part = {
    text: `Analyze this image from a drone. The drone is investigating a potential wildfire alert.
    Is there clear evidence of a wildfire (e.g., smoke plumes, active flames) in this image?
    Respond ONLY with a JSON object with the following schema:
    {
      "is_fire": boolean, // true if fire/smoke is detected, false otherwise
      "confidence": number, // confidence score from 0.0 to 1.0
      "reasoning": "string" // brief textual explanation of your assessment
    }`,
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_VISION_MODEL, 
        contents: [{ role: "user", parts: [imagePart, textPart] }],
        config: {
            responseMimeType: "application/json",
            temperature: 0.2, 
        }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; 
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }
    
    const result = JSON.parse(jsonStr) as AIVerificationResult;
    if (typeof result.is_fire !== 'boolean' || typeof result.confidence !== 'number' || typeof result.reasoning !== 'string') {
        console.error("AI Verification: Invalid JSON structure received.", result);
        throw new Error("Invalid JSON structure from AI verification.");
    }
    return result;

  } catch (error) {
    console.error("Error calling Gemini API for AI verification:", error);
    return {
      is_fire: false, 
      confidence: 0.0,
      reasoning: "AI verification failed due to an API error. Manual check required.",
    };
  }
};


export const initializeChat = async (ai: GoogleGenAI, systemInstruction: string): Promise<Chat> => {
    const chat = ai.chats.create({
        model: GEMINI_TEXT_MODEL,
        config: { systemInstruction },
    });
    return chat;
};
