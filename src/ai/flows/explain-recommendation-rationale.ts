'use server';

/**
 * @fileOverview Analyzes partnership compatibility and explains the rationale.
 *
 * - explainRecommendation - A function that takes two company profiles and returns a compatibility score and rationale.
 * - ExplainRecommendationInput - The input type for the explainRecommendation function.
 * - ExplainRecommendationOutput - The return type for the explainRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainRecommendationInputSchema = z.object({
  userCompanyProfile: z.string().describe('Profile details of the user\'s company.'),
  candidateCompanyProfile: z.string().describe('Profile details of the candidate company.'),
});
export type ExplainRecommendationInput = z.infer<typeof ExplainRecommendationInputSchema>;

const ExplainRecommendationOutputSchema = z.object({
  compatibilityScore: z.number().describe('A compatibility score between 0 and 100.'),
  compatibilityReason: z.string().describe('A short, objective, and professional explanation justifying the recommendation.'),
});
export type ExplainRecommendationOutput = z.infer<typeof ExplainRecommendationOutputSchema>;

export async function explainRecommendation(input: ExplainRecommendationInput): Promise<ExplainRecommendationOutput> {
  return explainRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainRecommendationPrompt',
  input: {schema: ExplainRecommendationInputSchema},
  output: {schema: ExplainRecommendationOutputSchema},
  prompt: `You are a B2B Business Analyst.

  Analyze the compatibility between the two companies below, considering their primary business activity (CNAE), operational complementarity, location, and business profile.

  Your tasks are:
  1.  Assign a compatibility score from 0 to 100.
  2.  Generate a short, objective, and institutional explanation justifying the recommendation.

  RULES:
  - Use professional language.
  - No informal terms.
  - No emojis.
  - No exaggerated marketing.

  User Company Profile: {{{userCompanyProfile}}}
  Candidate Company Profile: {{{candidateCompanyProfile}}}
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
