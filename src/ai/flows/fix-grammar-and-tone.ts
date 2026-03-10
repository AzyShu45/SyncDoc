'use server';
/**
 * @fileOverview An AI agent for correcting grammar and spelling, and suggesting tone improvements.
 *
 * - fixGrammarAndTone - A function that handles the grammar/tone correction process.
 * - FixGrammarAndToneInput - The input type for the fixGrammarAndTone function.
 * - FixGrammarAndToneOutput - The return type for the fixGrammarAndTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FixGrammarAndToneInputSchema = z.object({
  documentContent: z.string().describe('The content of the document to be corrected.'),
});
export type FixGrammarAndToneInput = z.infer<typeof FixGrammarAndToneInputSchema>;

const FixGrammarAndToneOutputSchema = z.object({
  correctedDocument: z.string().describe('The document content with grammar and spelling errors corrected.'),
  toneSuggestions: z.string().optional().describe('Suggestions for improving the tone of the document.'),
});
export type FixGrammarAndToneOutput = z.infer<typeof FixGrammarAndToneOutputSchema>;

export async function fixGrammarAndTone(input: FixGrammarAndToneInput): Promise<FixGrammarAndToneOutput> {
  return fixGrammarAndToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fixGrammarAndTonePrompt',
  input: {schema: FixGrammarAndToneInputSchema},
  output: {schema: FixGrammarAndToneOutputSchema},
  prompt: `You are an expert editor specializing in grammar, spelling, and tone improvement. Your task is to review the provided document content.

First, correct any grammar and spelling errors you find in the document.
Second, provide constructive suggestions for improving the overall tone of the document to make it more clear, professional, and impactful. If the tone is already good, you can state that.

Output the corrected document content in the 'correctedDocument' field and your tone suggestions in the 'toneSuggestions' field.

Document Content:

---
{{{documentContent}}}
---
`,
});

const fixGrammarAndToneFlow = ai.defineFlow(
  {
    name: 'fixGrammarAndToneFlow',
    inputSchema: FixGrammarAndToneInputSchema,
    outputSchema: FixGrammarAndToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
