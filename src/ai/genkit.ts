import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({
      apiKey: process.env.GEMINI_API_KEY
  })],
  // The model is specified in the prompt/generation call
});
