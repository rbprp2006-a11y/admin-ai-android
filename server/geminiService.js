import { GoogleGenAI } from '@google/genai';

export class GeminiService {
  static getApiKey() {
    return process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
  }

  static async generateResponse(prompt, context = {}) {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return {
        mode: 'local',
        message: 'Gemini not configured',
        status: 'local_fallback',
        response: 'Gemini API Key is not configured on this server. To enable real-time Gemini AI, configure GEMINI_API_KEY in server/.env file.'
      };
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are ADMIN AI, the enterprise facility & administration operations engine for Smart Admin Department. Answer queries regarding facility maintenance, visitors, transport, assets, vendors, meeting rooms, gate passes, housekeeping, utilities, cafeteria, and documents concisely and professionally.`;

      const contents = [
        context?.history ? `Context: ${JSON.stringify(context.history)}` : '',
        prompt
      ].filter(Boolean).join('\n\n');

      const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

      // Race with timeout so server never hangs if internet is slow/unreachable
      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API call timed out after 5000ms')), 5000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);

      return {
        mode: 'gemini',
        status: 'success',
        response: response.text || 'No response generated.',
        model: modelName
      };
    } catch (error) {
      console.error('Gemini Gateway Error (Safe Log):', error.message || error);
      return {
        mode: 'local',
        status: 'error',
        message: 'Gemini API call failed',
        error: error.message || 'Unknown upstream AI error',
        fallback: 'Gemini service encountered a network or quota error. Local rules engine can process your administrative request.'
      };
    }
  }
}
