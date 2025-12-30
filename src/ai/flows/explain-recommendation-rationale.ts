'use server';

/**
 * @fileOverview Explains the rationale behind a partnership recommendation.
 *
 * - explainRecommendation - A function that takes partnership details and explains the AI's reasoning.
 * - ExplainRecommendationInput - The input type for the explainRecommendation function.
 * - ExplainRecommendationOutput - The return type for the explainRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainRecommendationInputSchema = z.object({
  companyProfile1: z.string().describe('Profile details of the first company.'),
  companyProfile2: z.string().describe('Profile details of the second company.'),
  objectiveCriteria: z.string().describe('Objective criteria for partnership consideration (location, CNAE, operational profile).'),
});
export type ExplainRecommendationInput = z.infer<typeof ExplainRecommendationInputSchema>;

const ExplainRecommendationOutputSchema = z.object({
  rationale: z.string().describe('A human-readable explanation of the AI reasoning behind the partnership recommendation.'),
});
export type ExplainRecommendationOutput = z.infer<typeof ExplainRecommendationOutputSchema>;

export async function explainRecommendation(input: ExplainRecommendationInput): Promise<ExplainRecommendationOutput> {
  return explainRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainRecommendationPrompt',
  input: {schema: ExplainRecommendationInputSchema},
  output: {schema: ExplainRecommendationOutputSchema},
  prompt: `You are a business analyst AI explaining partnership recommendations between two companies.

  Based on the provided company profiles and objective criteria, clearly explain the rationale behind recommending a partnership. Justify each suggestion with professional context.

  Company Profile 1: {{{companyProfile1}}}
  Company Profile 2: {{{companyProfile2}}}
  Objective Criteria: {{{objectiveCriteria}}}
  `,
});

const explainRecommendationFlow = ai.defineFlow(
  {
    name: 'explainRecommendationFlow',
    inputSchema: ExplainRecommendationInputSchema,
    outputSchema: ExplainRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
