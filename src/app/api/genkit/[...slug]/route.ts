import { genkitNextHandler } from '@genkit-ai/next';
import '@/ai/flows/explain-recommendation-rationale';
import '@/ai/flows/generate-partnership-recommendations';

export const { GET, POST } = genkitNextHandler();
