'use server';

/**
 * @fileOverview Generates partnership recommendations for a given company profile using AI.
 *
 * - generatePartnershipRecommendations - A function that handles the generation of partnership recommendations.
 * - GeneratePartnershipRecommendationsInput - The input type for the generatePartnershipRecommendations function.
 * - GeneratePartnershipRecommendationsOutput - The return type for the generatePartnershipRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePartnershipRecommendationsInputSchema = z.object({
  companyProfile: z.string().describe('The company profile to generate partnership recommendations for.'),
});
export type GeneratePartnershipRecommendationsInput = z.infer<typeof GeneratePartnershipRecommendationsInputSchema>;

const GeneratePartnershipRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('The generated partnership recommendations.'),
  reasoning: z.string().describe('The reasoning behind the recommendations.'),
});
export type GeneratePartnershipRecommendationsOutput = z.infer<typeof GeneratePartnershipRecommendationsOutputSchema>;

export async function generatePartnershipRecommendations(
  input: GeneratePartnershipRecommendationsInput
): Promise<GeneratePartnershipRecommendationsOutput> {
  return generatePartnershipRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePartnershipRecommendationsPrompt',
  input: {schema: GeneratePartnershipRecommendationsInputSchema},
  output: {schema: GeneratePartnershipRecommendationsOutputSchema},
  prompt: `You are a business analyst specializing in identifying potential business partnerships.

  Given the following company profile, generate partnership recommendations and explain your reasoning.

  Company Profile: {{{companyProfile}}}

  Format the output as follows:
  Recommendations: [List of partnership recommendations]
  Reasoning: [Explanation of the reasoning behind the recommendations]`,
});

const generatePartnershipRecommendationsFlow = ai.defineFlow(
  {
    name: 'generatePartnershipRecommendationsFlow',
    inputSchema: GeneratePartnershipRecommendationsInputSchema,
    outputSchema: GeneratePartnershipRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
